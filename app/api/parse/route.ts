import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { checkRateLimit, getRequestIp } from '@/utils/rate-limit';
import { withRetry } from '@/utils/gemini-retry';
import { getGeminiModel, PARSE_SAFETY_SETTINGS } from '@/lib/gemini';

const buildPrompt = (input: string) => `
You are an assistant that only outputs valid JSON.
Parse the user-provided expense text into a JSON array.

STRICT RULE: You must ONLY extract an amount if the user explicitly types a number in the text. Do NOT guess, estimate, or look up prices from your knowledge.

If the user input contains NO numeric values:
- Set is_expense to false.
- Set funny_comment to a Hinglish roast asking for the price (e.g., "Bhai free mein mil raha hai kya? Price to bata!").

If the user input DOES contain a number:
- Set is_expense to true (unless it's clearly not an expense).
- Extract the amount.

CURRENCY RULE: The database ONLY stores Canadian Dollars (CAD). If the user inputs USD, INR, or EUR:
- Convert it to CAD using approximate current rates (e.g., 1 USD = 1.4 CAD, 1 INR = 0.016 CAD).
- Store the CONVERTED amount.
- Append the original price to the item name (e.g., 'Freelancer (50 USD)').

CATEGORIZATION RULE: Never return null for category or type. If the input is NSFW or questionable, categorize it as 'Adult' or 'Entertainment' and mark it as a 'Want'.

Each entry must include the following keys:
- is_expense (boolean: true if the input describes a valid expense AND contains a number, false otherwise)
- item_name (string: the name/description of the expense. Crucial: Do not use 'item'. Use 'item_name'. Null if is_expense is false)
- amount (number: null if is_expense is false)
- category (string: null if is_expense is false)
- type (string: "Need" or "Want". Null if is_expense is false)
- date (string formatted as YYYY-MM-DD. Null if is_expense is false)
- emoji (string: A single, relevant Emoji for the expense item. e.g., Pizza -> 🍕, Uber -> 🚖, Rent -> 🏠. If you can't match it, use 💸. Null if is_expense is false)
- funny_comment (string: a short, witty, subtle comment in 'Hinglish' (Indian/English mix). If is_expense is true, roast the spending. If false, reply to the user's message wittily. Keep it short. All monetary values are in Canadian Dollars (CAD). Never mention 'Rupees', 'INR', or 'USD' in your funny comments. Assume the context is Canada.)

If a field is missing, infer it conservatively.
Return ONLY the JSON array without code fences, explanations, or markdown.

Expense text:
${input.trim()}
`;

const stripCodeFences = (text: string): string => {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return match ? match[1].trim() : text.trim();
};

interface ParsedExpense {
  is_expense: boolean;
  item_name: string | null;
  amount: number | null;
  category: string | null;
  type: 'Need' | 'Want' | null;
  date: string | null;
  emoji: string | null;
  funny_comment: string;
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

  const body = (await req.text()).trim();
  if (!body) {
    return NextResponse.json({ error: 'Request body must contain expense text.' }, { status: 400 });
  }

  try {
    const model = getGeminiModel(apiKey, PARSE_SAFETY_SETTINGS);
    const result = await withRetry(() => model.generateContent(buildPrompt(body)));
    const raw = result.response.text();
    const expenses = JSON.parse(stripCodeFences(raw)) as ParsedExpense[];

    if (!Array.isArray(expenses)) {
      throw new Error('AI response was not a valid array.');
    }

    const today = new Date().toISOString().split('T')[0];
    expenses.forEach((exp) => {
      if (exp.is_expense && !exp.date) exp.date = today;
    });

    return NextResponse.json(expenses);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred.';
    console.error('[/api/parse] Gemini error:', {
      message,
      status: (error as { status?: number })?.status,
      errorDetails: (error as { errorDetails?: unknown })?.errorDetails,
    });
    const isRateLimited = (error as { status?: number })?.status === 429 || message.includes('429');
    return NextResponse.json(
      { error: isRateLimited ? 'AI service is temporarily rate limited, try again in a minute.' : `Parse failed: ${message}` },
      { status: isRateLimited ? 429 : 500 },
    );
  }
}
