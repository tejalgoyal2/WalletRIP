import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/utils/supabase/server';
import { checkRateLimit, getRequestIp } from '@/utils/rate-limit';
import { withRetry } from '@/utils/gemini-retry';

const MODEL_NAME = 'gemini-2.5-flash-lite';

export async function POST(req: Request) {
    // Rate limiting
    const ip = getRequestIp(req);
    const { allowed, retryAfter } = checkRateLimit(ip);
    if (!allowed) {
        return NextResponse.json(
            { error: 'AI service is temporarily rate limited, try again in a minute.' },
            { status: 429, headers: { 'Retry-After': String(retryAfter) } }
        );
    }

    // Auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return NextResponse.json(
            { error: 'Unauthorized. Please log in.' },
            { status: 401 }
        );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: 'GEMINI_API_KEY is not configured.' },
            { status: 500 },
        );
    }

    try {
        const body = await req.json();
        const { expenses } = body;

        if (!expenses || !Array.isArray(expenses)) {
            return NextResponse.json(
                { error: 'Invalid expenses data.' },
                { status: 400 }
            );
        }

        if (expenses.length === 0) {
            return NextResponse.json({ roast: "You haven't spent anything. Are you a ghost? 👻" });
        }

        // Prepare prompt
        const expenseSummary = expenses.slice(0, 20).map((e: any) =>
            `${e.item_name} ($${e.amount}) - ${e.type}`
        ).join('\n');

        const prompt = `
        Analyze this list of expenses:
        ${expenseSummary}

        CONTEXT: The user is in Canada. All amounts are in Canadian Dollars (CAD). Never use the Rupee symbol (₹). Use '$'. Even if speaking Hinglish, keep the currency Canadian.

        Write a short, sarcastic, funny 'Performance Review' in Hinglish (Indian/English mix).
        Roast the user for their bad financial decisions, specifically pointing out 'Wants' or high amounts.
        Keep it under 60 words. Be brutal but funny.
        `;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const result = await withRetry(() => model.generateContent(prompt));
        const response = await result.response;
        const roast = response.text();

        return NextResponse.json({ roast });

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error occurred.';
        console.error('[/api/roast] Gemini error:', {
            message,
            status: (error as any)?.status,
            statusText: (error as any)?.statusText,
            errorDetails: (error as any)?.errorDetails,
            full: error,
        });
        const isRateLimited = (error as any)?.status === 429 || message.includes('429');
        const clientMessage = isRateLimited
            ? 'AI service is temporarily rate limited, try again in a minute.'
            : `Failed to generate roast: ${message}`;
        return NextResponse.json(
            { error: clientMessage },
            { status: isRateLimited ? 429 : 500 }
        );
    }
}
