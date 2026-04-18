# SpecForge AI

> AI Execution Co-Founder for First-Time Founders

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
Copy `.env.local.example` to `.env.local` and fill in your OpenAI API key:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local`:
```
OPENAI_API_KEY=sk-...your-key...
```

### 3. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **OpenAI GPT-4o** via API
- **JWT auth** (in-memory store for MVP)

## Features
- 🔍 AI-powered problem diagnosis
- 📋 TODAY action plan (max 3, timed)
- 🔗 Real resource links
- ⚡ Reality check triggers
- 📊 6-category routing (Technical, Product, Operational, Growth, Financial, Personal)
- 🌍 Geography-aware advice
- 💾 Session history
- 👍 Feedback tracking

## Structure
```
src/
├── app/
│   ├── api/
│   │   ├── auth/signup/route.ts
│   │   ├── auth/login/route.ts
│   │   ├── auth/me/route.ts
│   │   ├── profile/route.ts
│   │   ├── solve/route.ts
│   │   ├── feedback/route.ts
│   │   └── history/route.ts
│   ├── auth/
│   │   ├── signup/page.tsx
│   │   └── login/page.tsx
│   ├── onboarding/page.tsx
│   ├── dashboard/page.tsx
│   └── page.tsx (landing)
├── components/
│   └── ResponseCards.tsx
├── lib/
│   ├── ai.ts (OpenAI integration)
│   ├── auth.ts (JWT utilities)
│   └── db.ts (in-memory store)
└── types/index.ts
```

## Upgrading to a Real Database
Replace the methods in `src/lib/db.ts` with Supabase/PostgreSQL calls.
The interface is the same — just swap the implementation.
