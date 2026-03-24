# ZITRUM — Project Context

## What is ZITRUM
ZITRUM is a global alternative investment discovery marketplace. We do NOT participate in investments, custody assets, or provide financial advice. We aggregate opportunities from vertical platforms worldwide (RealT, Lofty, Republic, Wefunder, Reental, StartEngine, etc.) and display them in a personalized feed based on the investor's profile.

Think of it as "Booking.com for alternative investments" — we show the inventory, the user clicks through to the original platform to invest.

## CRITICAL: Language
- ALL code, comments, variable names, UI text, microcopy, error messages, placeholders, and content MUST be in English.
- No Spanish, no mixed languages. Everything in English.

## Tech Stack
- Framework: Next.js 14+ (App Router, Server Components)
- Language: TypeScript strict mode
- Styling: Tailwind CSS + shadcn/ui
- Database: Supabase (PostgreSQL) via Prisma ORM
- Auth: Supabase Auth (email/password + Google OAuth)
- Deploy: Vercel
- Scraping: Cheerio for static HTML, Puppeteer for SPAs
- State: Zustand for client-side global state
- Validation: Zod for all form inputs and API payloads
- Email: Resend for transactional emails

## Code Style
- Functional components only, never class components
- Named exports only, never default exports
- ES modules (import/export), never CommonJS (require)
- Files in kebab-case, components in PascalCase
- Use async/await, never callbacks
- Validation with Zod schemas
- Error handling with try/catch and structured logging
- All comments in English
- Prefer Server Components; use "use client" only when necessary
- Co-locate types with their modules when possible

## Key Data Models
- `Opportunity`: an investable asset scraped from a vertical platform
- `Platform`: a vertical platform source (RealT, Republic, etc.)
- `InvestorProfile`: user profile with interests, risk tolerance, capital range, preferences
- `MatchResult`: compatibility score between a profile and an opportunity

## Commands
- `npm run dev` — Development server (http://localhost:3000)
- `npm run build` — Production build
- `npm run lint` — ESLint check
- `npx prisma db push` — Sync schema to Supabase
- `npx prisma generate` — Regenerate Prisma client
- `npx prisma studio` — Visual DB browser
- `npm run scrape` — Run all scrapers manually

## Business Rules
- Never imply that ZITRUM offers, recommends, or endorses any investment
- Always include legal disclaimers: "ZITRUM does not provide financial advice. All investments carry risk."
- Platform links must include UTM tracking: ?utm_source=zitrum&utm_medium=referral&utm_campaign=[page]
- Match scores are informational only, never financial advice
- Respect rate limits when scraping (minimum 2 seconds between requests per platform)
- All user-facing text must be in English

## Design System
- Background: #0A0A0B (near black)
- Card surfaces: #1A1A1D
- Gold accent: #D4A853 (CTAs, highlights, premium elements)
- Text primary: #FFFFFF
- Text secondary: #A1A1AA
- Border: #27272A
- Success: #22C55E
- Warning: #EAB308
- Danger: #EF4444
- Border radius: 8px for cards, 6px for buttons, 9999px for badges
- Font: system sans-serif stack (Inter if available)

## Folder Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing page
│   ├── feed/page.tsx       # Main opportunity feed
│   ├── opportunity/[id]/   # Opportunity detail
│   ├── profile/page.tsx    # Investor profile
│   ├── onboarding/page.tsx # Profile setup wizard
│   └── api/                # API routes
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── feed/               # Feed-specific components
│   ├── profile/            # Profile components
│   └── layout/             # Header, sidebar, footer, nav
├── lib/
│   ├── scrapers/           # One file per platform
│   ├── matching/           # Matching algorithm
│   ├── supabase.ts         # Supabase client
│   └── utils.ts            # Shared utilities
└── types/                  # TypeScript interfaces and enums
```
