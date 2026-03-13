import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { checkRateLimit, getRequestIp } from '@/utils/rate-limit';
import { withRetry } from '@/utils/gemini-retry';
import { getGeminiModel } from '@/lib/gemini';

interface ExpenseInput {
  item_name: string;
  amount: number;
  category: string;
  type: string;
  date: string;
}

// Strip characters that could manipulate the prompt
function sanitize(s: string): string {
  return s.replace(/[<>"'`\n\r]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
}

export async function POST(req: Request) {
  const ip = getRequestIp(req);
  const { allowed, retryAfter } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: 'AI service is temporarily rate limited, try again in a minute.' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not configured.' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const expenses: ExpenseInput[] = body.expenses;

    if (!Array.isArray(expenses) || expenses.length === 0) {
      return NextResponse.json({ error: 'No expense data provided.' }, { status: 400 });
    }

    const total = expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);

    const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
      const cat = sanitize(e.category ?? 'Other');
      acc[cat] = (acc[cat] ?? 0) + (e.amount ?? 0);
      return acc;
    }, {});

    const topCategories = Object.entries(byCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([cat, amt]) => `${cat}: $${amt.toFixed(2)}`)
      .join(', ');

    const wantTotal = expenses
      .filter(e => e.type === 'Want')
      .reduce((sum, e) => sum + (e.amount ?? 0), 0);

    const expenseList = expenses
      .slice(0, 40)
      .map(e => `${e.date} | ${sanitize(e.item_name ?? '')} | $${(e.amount ?? 0).toFixed(2)} | ${sanitize(e.category ?? '')} | ${e.type}`)
      .join('\n');

    const prompt = `You are a personal finance assistant for a user in Canada. Analyze these expenses from the last 30 days and write a short spending summary.

Summary stats:
- Total spent: $${total.toFixed(2)} CAD
- Wants portion: $${wantTotal.toFixed(2)} CAD (${total > 0 ? Math.round((wantTotal / total) * 100) : 0}%)
- Top categories: ${topCategories}

Expense log:
${expenseList}

Write a 2–3 sentence summary. Rules:
- Speak directly to the user as "you"
- Mention at least one specific amount or category name
- Note one pattern (positive or concerning)
- Keep it under 75 words, plain prose — no bullet points, no markdown
- All amounts are in Canadian Dollars (CAD)`;

    const model = getGeminiModel(apiKey);
    const result = await withRetry(() => model.generateContent(prompt));
    const insight = result.response.text().trim();

    return NextResponse.json({ insight });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[/api/insights] error:', {
      message,
      status: (error as { status?: number })?.status,
    });
    const isRateLimited = (error as { status?: number })?.status === 429 || message.includes('429');
    return NextResponse.json(
      { error: isRateLimited ? 'AI service is temporarily rate limited, try again in a minute.' : 'Failed to generate insights.' },
      { status: isRateLimited ? 429 : 500 },
    );
  }
}
