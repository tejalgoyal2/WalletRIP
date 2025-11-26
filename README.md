# WalletRIP 💸

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini_AI-8E75B2?style=for-the-badge&logo=google-bard&logoColor=white)

> **Stop lying to yourself about where the money went.**

## 🔗 Live Demo
[walletRIP.vercel.app](https://walletrip.vercel.app)

## 🧐 The Vibe
Most expense trackers are boring spreadsheets that feel like homework. **WalletRIP** is your wallet's conscience. It doesn't just track your spending; it judges it.

It’s built for speed, privacy, and brutal honesty.

## ✨ Key Features

### 🧠 The AI Brain
Forget forms. Just type naturally: *"Spent 50 on pizza"* or *"Uber to work 25"*. The integrated AI parses the context, categorizes it, and logs it instantly. No local processing—everything happens in the cloud for maximum efficiency.

### ⚖️ The Sarcastic Judge
If you spend money on "Needs" (Rent, Groceries), it stays quiet. If you blow cash on "Wants" (Lego, overpriced coffee), it delivers a sarcastic reality check. It keeps you humble.

### 👻 Ghost Protocol Auth
Privacy is paramount.
- **No Email Required**: We don't want your spam address.
- **No Phone Numbers**: We don't want to text you.
- **Callsign Access**: Just pick a unique **Callsign** (username) and a **Secret Code**.
- **Universal Sync**: Access your data securely from any device—Mobile, Tablet, or Desktop.

### 🛡️ Military-Grade Security
Built on **Supabase** with strict **Row Level Security (RLS)**. Your financial data is isolated, encrypted, and visible *only* to you.

## 👥 How to Join
This is a private instance (I'm broke and can't pay for everyone's API usage), but you can join if you have an invite code.

1. **Go to [walletRIP.vercel.app](https://walletrip.vercel.app)**
2. **Click "Sign Up"**
3. **Choose a Callsign**: This is your unique username. Be creative.
4. **Set a Secret Code**: Must be at least 6 characters. Don't forget it; there is no "Forgot Password" link.
5. **Enter Invite Code**: You need a key to enter.

**Need a key? Slide into my DMs:**
- 💼 **LinkedIn**: [Tejal Goyal](https://www.linkedin.com/in/tejalgoyal)
- 📸 **Instagram**: [@teejpol](https://www.instagram.com/teejpol)

*(I try to reply ASAP, but no guarantees. I have a life... mostly.)*

*Want to run your own instance? Follow the setup guide below.*

## 🛠️ The Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + Framer Motion
- **Intelligence**: Google Gemini 1.5 Flash

## 🚀 Getting Started (Self-Host)

### 1. Clone & Install
```bash
git clone https://github.com/tejalgoyal/spendlog.git
cd spendlog
npm install
```

### 2. Environment Setup
Create a `.env.local` file:
```env
GEMINI_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 3. Run Locally
```bash
npm run dev
```

---
Built with 🖤 and absolute chaos by **Tejal**.
