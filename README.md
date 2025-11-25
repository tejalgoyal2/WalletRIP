# WalletRIP 💸

> The AI-powered expense tracker that roasts your bad financial decisions.

## The Pitch

Most finance apps are boring spreadsheets in disguise. They make you manually enter "Category: Food, Amount: $15, Date: Today". Yawn.

**WalletRIP** is different. You just type "Burger 50" or "Uber to work 200", and our AI brain figures out the rest. Oh, and it judges you. If you spend money on dumb stuff, it will roast you in Hinglish. If you try to chat with it, it will sass you back.

## Key Features

- **🧠 Gemini AI Brain**: Powered by Google's Gemini Pro. It parses natural language inputs like "Coffee with friends 500" into structured data (Item, Amount, Category, Type).
- **🤬 Hinglish Roasts**: It doesn't just track expenses; it has a personality. It recognizes non-expenses and spending habits to give sarcastic, witty commentary in Hinglish.
- **🔐 Callsign Auth**: Privacy-first authentication. No emails, no phone numbers. Just pick a unique "Callsign" and a secret code. Includes a sarcastic "Name Taken" shake animation if you try to steal someone's identity.
- **🛡️ Military-Grade Security**: Built on Supabase with strict Row Level Security (RLS). Your data is isolated and only accessible by you.
- **📱 Native Feel**: Designed with a mobile-first approach. Smooth framer-motion animations, dark mode support, and PWA-ready UI.

## The Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini Pro (`gemini-2.0-flash`)
- **Styling**: Tailwind CSS + Framer Motion
- **Deployment**: Vercel

## Local Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/yourusername/walletrip.git
   cd walletrip
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file in the root directory and add the following:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

4. **Database Setup**
   Run the provided SQL script in your Supabase SQL Editor to set up the `expenses` table and RLS policies.

5. **Run the app**
   ```bash
   npm run dev
   ```

## Privacy Note

This is a private instance designed for personal use. To run this yourself, you will need your own API keys and Supabase project. Your financial data stays in your own database.
