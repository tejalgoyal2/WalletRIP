import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { checkRateLimit, getRequestIp } from '@/utils/rate-limit';
import { withRetry } from '@/utils/gemini-retry';
import { getGeminiModel } from '@/lib/gemini';

interface ExpenseInput {
  item_name: string;
  amount: number;
  date: string;
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

    if (!expenses || !Array.isArray(expenses)) {
      return NextResponse.json({ error: 'Invalid expenses data.' }, { status: 400 });
    }

    if (expenses.length === 0) {
      return NextResponse.json({
        subscriptions: [],
        total_monthly_cost: 0,
        advice: 'No expenses found. You are free from the subscription trap!',
      });
    }

    const expenseSummary = expenses
      .map((e) => `${e.date}: ${e.item_name} ($${e.amount})`)
      .join('\n');

    const prompt = `
    Analyze these expenses to identify potential recurring subscriptions (e.g., Netflix, Spotify, Gym, iCloud, or same amount recurring monthly).

    Expenses:
    ${expenseSummary}

    Return a JSON object with this EXACT structure (no markdown, just raw JSON):
    {
        "subscriptions": [
            { "name": "Service Name", "amount": 0.00, "frequency": "Monthly/Yearly" }
        ],
        "total_monthly_cost": 0.00,
        "advice": "Short advice on managing these subscriptions."
    }
    `;

    const model = getGeminiModel(apiKey);
    const result = await withRetry(() => model.generateContent(prompt));
    const text = result.response.text();
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanedText);

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred.';
    console.error('[/api/analyze-subs] Gemini error:', {
      message,
      status: (error as { status?: number })?.status,
      errorDetails: (error as { errorDetails?: unknown })?.errorDetails,
    });
    const isRateLimited = (error as { status?: number })?.status === 429 || message.includes('429');
    return NextResponse.json(
      { error: isRateLimited ? 'AI service is temporarily rate limited, try again in a minute.' : `Failed to analyze subscriptions: ${message}` },
      { status: isRateLimited ? 429 : 500 },
    );
  }
}
