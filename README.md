# WalletRIP

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_2.5-8E75B2?style=for-the-badge&logo=google&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

> **Stop lying to yourself about where the money went.**

WalletRIP is a personal expense tracker that uses AI to parse natural language into structured expense data. Type what you spent in plain English, and the app categorizes it, detects the currency, and logs it instantly. It also roasts your spending habits in Hinglish, detects recurring subscriptions, and generates AI-powered spending insights.

**Live at** [wallet.tgoyal.me](https://wallet.tgoyal.me)

---

## What It Does

**Natural language expense logging.** No forms, no dropdowns. Type `"coffee at starbucks $5"` or `"uber to airport 34 usd"` and the AI handles the rest — amount extraction, currency conversion to CAD, category assignment, and need/want classification.

**AI spending insights.** On-demand Gemini-generated analysis of your last 30 days: top categories, need/want ratio trends, and specific observations about your spending patterns.

**Spending roasts.** A sarcastic AI-generated commentary on your monthly spending, delivered in Hinglish. Triggered manually — not on every page load.

**Subscription detection.** Paste your expenses and let Gemini identify recurring charges you might have forgotten about.

**Bulk import.** Paste raw bank statement text or a list of expenses, and the AI parses them all at once. Preview before importing, select/deselect individual items, then bulk insert.

**Spending trends.** Stacked bar chart showing Needs vs Wants over time, with weekly and monthly toggle. Built on Recharts.

**Mobile-first.** Add to your iPhone/Android home screen as a PWA. The entire UI is optimized for quick-log on mobile — open, type, done.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Runtime | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + Framer Motion |
| Charts | Recharts |
| AI | Google Gemini 2.5 Flash-Lite via `@google/generative-ai` |
| Auth + DB | Supabase (PostgreSQL, Row Level Security, SSR auth) |
| Deployment | Cloudflare Pages |
| Domain | wallet.tgoyal.me (via Cloudflare DNS) |

---

## Security

This is a public repo, so security was treated seriously:

- **Server-side invite code validation.** The invite code gate is enforced via an API route (`/api/validate-invite`), not in client-side JavaScript. The code is stored in an environment variable, never shipped in the browser bundle.
- **Row Level Security (RLS).** All Supabase queries are scoped to the authenticated user. No user can read, modify, or delete another user's data.
- **Per-IP rate limiting.** All AI-powered API routes share a 20 req/min per-IP limit to prevent quota abuse.
- **Input sanitization.** Expense descriptions are stripped of HTML, script tags, and control characters before being sent to Gemini to mitigate prompt injection.
- **Exponential backoff retry.** All Gemini calls use a 3-retry strategy (2s/4s/8s) on 429 and 503 errors with user-friendly error messages.
- **No secrets in source.** All credentials are in `.env.local` (gitignored). A `.env.example` documents every required variable.
- **Gemini safety filters.** Hate speech, sexually explicit, and dangerous content filters are set to `BLOCK_MEDIUM_AND_ABOVE`. Harassment is set to `BLOCK_NONE` to avoid false positives on expense descriptions.
- **Admin role via env var.** Admin UI features are gated by a full email match stored in an environment variable, not a hardcoded string.

---

## Architecture

```
Client (React 19)
  |
  |-- expense-form.tsx -----> POST /api/parse ---------> Gemini 2.5 Flash-Lite
  |-- insights-card.tsx ----> POST /api/insights ------> Gemini 2.5 Flash-Lite
  |-- monthly-roast.tsx ----> POST /api/roast ----------> Gemini 2.5 Flash-Lite
  |-- subscription-hunter --> POST /api/analyze-subs ---> Gemini 2.5 Flash-Lite
  |-- bulk-import-modal ----> POST /api/parse ---------> Gemini 2.5 Flash-Lite
  |
  |-- All routes: auth check + rate limit + retry + sanitize
  |
  |-- Supabase (PostgreSQL + RLS)
       |-- expenses table (user-scoped)
       |-- auth.users (callsign-based, no email required)
```

All AI calls are server-side only. The Gemini API key never reaches the client.

---

## Local Development

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)
- A [Google AI Studio](https://aistudio.google.com/apikey) API key (free tier: 1,000 req/day on Flash-Lite)

### Setup

```bash
git clone https://github.com/tejalgoyal2/WalletRIP.git
cd WalletRIP
npm install
cp .env.example .env.local
```

Fill in `.env.local`:

```env
# Supabase — supabase.com > your project > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Google AI — aistudio.google.com/apikey
GEMINI_API_KEY=AIza...

# App config
INVITE_CODE=your-invite-code
ADMIN_EMAIL=you@example.com
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Supabase Schema

The app expects an `expenses` table with RLS enabled:

```sql
create table expenses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  description text not null,
  amount numeric not null,
  category text not null,
  type text not null check (type in ('Need', 'Want')),
  funny_comment text,
  date date not null default current_date,
  created_at timestamptz default now()
);

-- Row Level Security
alter table expenses enable row level security;

create policy "Users can view own expenses"
  on expenses for select using (auth.uid() = user_id);

create policy "Users can insert own expenses"
  on expenses for insert with check (auth.uid() = user_id);

create policy "Users can delete own expenses"
  on expenses for delete using (auth.uid() = user_id);
```

---

## Mobile Install (PWA)

WalletRIP is designed for quick-log from your phone home screen.

- **iOS**: Safari > Share > Add to Home Screen
- **Android**: Chrome > Menu (three dots) > Install App

---

## Version History

### v2.0.0 (March 2026)
- Migrated from Gemini 2.0 Flash (deprecated) to Gemini 2.5 Flash-Lite
- Security hardening: server-side invite code, rate limiting, input sanitization, retry logic
- Replaced all `alert()` calls with toast notifications
- Mobile-responsive expense cards (card layout on mobile, table on desktop)
- AI Spending Insights — on-demand Gemini analysis of your last 30 days
- Spending Trends — stacked Needs vs Wants bar chart with weekly/monthly toggle
- Bulk Import — paste bank statements, AI parses, preview and confirm
- Accessibility: ARIA labels, dialog roles, focus management, removed viewport zoom lock
- Natural language input discoverability: rotating placeholders, helper text
- Backdrop click to close on all modals
- Shared Gemini utility (`lib/gemini.ts`) eliminating config duplication across routes
- TypeScript strictness improvements: removed `any` types, added interfaces

### v1.0.0 (December 2025)
- Initial release
- Natural language expense parsing via Gemini
- Needs vs Wants donut chart
- Monthly spending roast in Hinglish
- Subscription detection
- Callsign-based auth (no email required)
- CSV export
- Panic Mode for impulse buy shaming

---

## Access

This is a private instance. You need an invite code to sign up.

**Want access?**
- [LinkedIn](https://www.linkedin.com/in/tejalgoyal)
- [Instagram](https://www.instagram.com/teejpol)

Want to run your own instance? Follow the local development guide above.