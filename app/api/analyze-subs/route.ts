import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/utils/supabase/server';

const MODEL_NAME = 'gemini-2.0-flash';

export async function POST(req: Request) {
    // 1. Security: Check Auth
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
            return NextResponse.json({
                subscriptions: [],
                total_monthly_cost: 0,
                advice: "No expenses found. You are free from the subscription trap!"
            });
        }

        // Prepare prompt
        const expenseSummary = expenses.map((e: any) =>
            `${e.date}: ${e.item_name} ($${e.amount})`
        ).join('\n');

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

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up potential markdown code blocks
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanedText);

        return NextResponse.json(data);

    } catch (error) {
        console.error('Subscription Analysis Error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze subscriptions.' },
            { status: 500 }
        );
    }
}
