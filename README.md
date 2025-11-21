# SpendLog 💸

> **Indie-grade expense clarity. From rough notes to structured data in seconds.**

![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Google%20Gemini-8E75B2?logo=google&logoColor=white)

---

## 🧐 The Philosophy
Most expense trackers are designed for accountants, not humans. They demand five fields just to log a coffee.  
**SpendLog** is built on two core beliefs:

1. **Friction kills consistency.** I should be able to text myself “spent 15 on burger” and move on.
2. **Needs vs. Wants matters most.** Knowing I spent $2K is useless; knowing $500 went to *Lego* (Want) vs. $1.5K to *Rent* (Need) is actionable.

## ⚡ How It Works
1. **Dump** – Paste rough notes like _“Bought a rivet set for 30 and paid 50 for electricity.”_
2. **Parse** – SpendLog sends it to **Google Gemini Flash (gemini-1.5-flash)**.
3. **Structure** – AI extracts item, amount, date, category, and Need/Want type.
4. **Store** – Clean data lands in Supabase, ready for insights.

## Features
- 🧠 **AI-powered parsing** – No manual forms, just natural language.
- 🗂️ **Smart categorization** – Need vs. Want tags generated automatically.
- 🔐 **Privacy-first** – Self-hosted stack keeps your money trail yours.
- 📲 **PWA-ready** – Pin it on your phone for on-the-go logging.

## 🛠️ Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Intelligence:** Google Gemini API (`gemini-1.5-flash`)
- **Deployment:** Vercel / PWA

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/tejalgoyal/spendlog.git
cd spendlog
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```env
# Google AI Studio
GEMINI_API_KEY=your_gemini_key_here

# Supabase (optional until Phase 3)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the app

```bash
npm run dev
```

Open `http://localhost:3000` to start logging.

## 🗺️ Roadmap
- [x] **Phase 1:** Project setup & AI parsing logic
- [ ] **Phase 2:** Input UI & tables
- [ ] **Phase 3:** Supabase persistence
- [ ] **Phase 4:** Needs vs. Wants visualizations
- [ ] **Phase 5:** PWA install flow (Add to Home Screen)

---

_Built with ☕ and code by Tejal._

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

---

Powered by Google Antigravity & Gemini 3 Pro
