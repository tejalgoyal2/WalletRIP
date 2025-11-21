# SpendLog 💸

_Indie-grade expense clarity in under 10 seconds._

![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?logo=google&logoColor=white)

---

## The Problem
Most expense trackers are either clunky, over-designed, or gated behind subscriptions. I just wanted a lightweight way to see how much of my flow went to **Needs** (rent, groceries, survival) versus **Wants** (Lego drops, shiny gadgets). Manual spreadsheets weren’t sticking, and app store options felt like bloatware.

## The Solution
SpendLog is a personal PWA that lets me brain dump rough notes like “spent 50 on lego” and lets Google Gemini convert that chaos into structured expense data. It stays self-hosted, fast, and honest about where the money actually goes.

## Features
- 🧠 **AI-powered parsing** – paste messy sentences, skip the forms.
- 🗂️ **Smart categorization** – auto labels every line as a Need or Want.
- 🔐 **Privacy-first** – run it on your own stack, keep the data yours.
- 📲 **PWA shell** – pin it on your phone, log spending anywhere.

## Getting Started
Clone and bootstrap your own SpendLog in minutes.

```bash
git clone https://github.com/tejalgoyal/spendlog.git
cd spendlog
npm install
```

Create `.env.local` and add:

```
GEMINI_API_KEY=your-google-gemini-key
```

Run the dev server:

```bash
npm run dev
```

Open `http://localhost:3000` and start logging.

---

## Original Next.js README
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
