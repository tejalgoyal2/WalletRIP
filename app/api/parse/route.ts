import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL_NAME = 'gemini-2.0-flash';

const buildPrompt = (input: string) => `
You are an assistant that only outputs valid JSON.
Parse the user-provided expense text into a JSON array.
Each entry must include the following keys:
- item_name (string: the name/description of the expense. Crucial: Do not use 'item'. Use 'item_name'.)
- amount (number)
- category (string)
- type (string: "Need" or "Want")
- date (string formatted as YYYY-MM-DD)
- funny_comment (string: a short, witty, subtle comment in 'Hinglish' (Indian/English mix) based on the expense. Examples: 'Paisa ped pe nahi ugta bro', 'Treat to banti hai', 'Kal se diet shuru'. Keep it short.)

If a field is missing, infer it conservatively.
Return ONLY the JSON array without code fences, explanations, or markdown.

Expense text:
${input.trim()}
`;

const stripCodeFences = (text: string) => {
  const fencePattern = /```(?:json)?\s*([\s\S]*?)```/i;
  const match = text.match(fencePattern);
  if (match) {
    return match[1].trim();
  }
  return text.trim();
};

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not configured.' },
      { status: 500 },
    );
  }

  const body = (await req.text()).trim();
  if (!body) {
    return NextResponse.json(
      { error: 'Request body must contain expense text.' },
      { status: 400 },
    );
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const result = await model.generateContent(buildPrompt(body));
    const response = await result.response;
    const raw = response.text();
    const cleaned = stripCodeFences(raw);
    const expenses = JSON.parse(cleaned);

    return NextResponse.json(expenses);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

