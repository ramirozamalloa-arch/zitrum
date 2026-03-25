# ZITRUM

**Alternative Investment Discovery Platform**

ZITRUM aggregates investment opportunities from 75+ vertical platforms worldwide (RealT, Republic, Lofty, Wefunder, StartEngine, Reental, and more) and displays them in a personalized feed based on each investor's profile. Think of it as "Booking.com for alternative investments" — we show the inventory, the user clicks through to the original platform to invest.

> ZITRUM does not provide financial advice, custody assets, or participate in investments. All opportunities link to third-party platforms.

---

## Tech Stack

- **Framework** — Next.js 16 (App Router, Server Components)
- **Language** — TypeScript (strict mode)
- **Styling** — Tailwind CSS + shadcn/ui
- **Database** — Supabase (PostgreSQL) via Prisma ORM
- **Auth** — Supabase Auth (email/password + Google OAuth)
- **Matching** — Custom scoring engine (6-dimension weighted algorithm)
- **State** — Zustand (client-side global state)
- **Validation** — Zod
- **Email** — Resend
- **Deploy** — Vercel

---

## Features

- Personalized investment feed with match scores (0–100%)
- 6-dimension matching engine: asset type, capital range, risk, region, return vs horizon, sector
- Investor onboarding wizard (5-step profile setup)
- Bookmark / save opportunities
- Opportunity detail pages with platform info and UTM-tracked invest links
- Auth-protected routes with session middleware
- Seed data from RealT, Republic, and Lofty

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ramirozamalloa-arch/zitrum.git
cd zitrum
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_postgres_connection_string
```

You can find these values in your [Supabase project settings](https://supabase.com/dashboard).

> **Vercel / serverless deployments:** You must use the **Supabase connection pooler URL** (not the direct connection). The direct URL (port 5432) does not work in serverless environments. Use the pooler URL from Supabase → Project Settings → Database → Connection string → **Transaction pooler**:
>
> ```
> postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
> ```
>
> Set this as `DATABASE_URL` in your Vercel environment variables.

### 4. Generate Prisma client and push schema

```bash
npx prisma generate
npx prisma db push
```

### 5. Seed the database

```bash
curl http://localhost:3000/api/seed
```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── feed/               # Personalized investment feed
│   ├── opportunity/[id]/   # Opportunity detail
│   ├── profile/            # Investor profile (read-only view)
│   ├── saved/              # Bookmarked opportunities
│   ├── onboarding/         # 5-step profile wizard
│   └── api/                # API routes (profile, match, bookmarks, seed)
├── components/
│   ├── feed/               # Feed cards, grid, match badge, top picks
│   ├── profile/            # Onboarding wizard steps
│   └── layout/             # Header, sidebar, footer
├── lib/
│   ├── matching/           # Scoring engine
│   ├── supabase.ts         # Browser Supabase client
│   ├── supabase-server.ts  # Server Supabase client
│   └── prisma.ts           # Prisma singleton
└── proxy.ts                # Auth session middleware
```

---

## Useful Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint check
npx prisma studio    # Visual database browser
npx prisma db push   # Sync schema to Supabase
```
