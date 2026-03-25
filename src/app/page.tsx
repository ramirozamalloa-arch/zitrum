export const dynamic = 'force-dynamic';

import Link from "next/link";
import {
  UserCircle,
  Compass,
  ExternalLink,
  Building2,
  Rocket,
  CreditCard,
  Palette,
  Wheat,
  BarChart3,
  ArrowRight,
  Check,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const PLATFORMS = ["RealT", "Lofty", "Republic", "Wefunder", "StartEngine", "Reental", "ADDX"];

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: UserCircle,
    title: "Build Your Profile",
    description:
      "Tell us your interests, risk tolerance, and investment goals. Takes 2 minutes.",
  },
  {
    step: "02",
    icon: Compass,
    title: "Discover Opportunities",
    description:
      "Get a personalized feed from 75+ platforms, matched to your profile and preferences.",
  },
  {
    step: "03",
    icon: ExternalLink,
    title: "Invest on the Platform",
    description:
      "Click through to invest directly on the original platform. We never touch your money.",
  },
];

const ASSET_CATEGORIES = [
  {
    key: "REAL_ESTATE",
    icon: Building2,
    title: "Real Estate",
    description: "Tokenized rental properties from $50",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "hover:border-blue-500/40",
  },
  {
    key: "STARTUP_EQUITY",
    icon: Rocket,
    title: "Startup Equity",
    description: "Back the next big company from $10",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "hover:border-purple-500/40",
  },
  {
    key: "PRIVATE_CREDIT",
    icon: CreditCard,
    title: "Private Credit",
    description: "Earn yields from private debt instruments",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "hover:border-amber-500/40",
  },
  {
    key: "ART_COLLECTIBLES",
    icon: Palette,
    title: "Art & Collectibles",
    description: "Own fractions of masterpieces and luxury items",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "hover:border-pink-500/40",
  },
  {
    key: "FARMLAND",
    icon: Wheat,
    title: "Farmland",
    description: "Invest in agricultural land and crops",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "hover:border-green-500/40",
  },
  {
    key: "PRIVATE_EQUITY",
    icon: BarChart3,
    title: "Private Equity",
    description: "Access institutional-grade fund opportunities",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    border: "hover:border-teal-500/40",
  },
];

const FAQ_ITEMS = [
  {
    value: "what-is-zitrum",
    question: "What is ZITRUM?",
    answer:
      "ZITRUM is a discovery platform that aggregates alternative investment opportunities from specialized platforms worldwide. We don't manage money, hold assets, or provide financial advice — we simply help you find and compare opportunities from vetted platforms in one place.",
  },
  {
    value: "is-it-free",
    question: "Is ZITRUM free?",
    answer:
      "Yes, browsing and discovering opportunities is completely free. We plan to offer a premium tier with advanced features — such as portfolio tracking, custom alerts, and deeper analytics — in the future.",
  },
  {
    value: "how-to-invest",
    question: "How do I invest?",
    answer:
      'When you find an opportunity you like, click the "Invest" button. You\'ll be redirected to the original platform — RealT, Republic, Lofty, etc. — where you\'ll create an account (if you don\'t have one) and invest directly. ZITRUM never processes transactions or holds funds.',
  },
  {
    value: "is-regulated",
    question: "Is this regulated?",
    answer:
      "ZITRUM is an aggregator and discovery tool, not a broker-dealer or investment advisor. Each platform we list is independently regulated in its jurisdiction (e.g., SEC Reg CF in the US, FCA in the UK). Always review the regulatory disclosures on the platform before investing.",
  },
  {
    value: "what-are-risks",
    question: "What are the risks?",
    answer:
      "All investments carry risk, including the potential loss of principal. Alternative investments are typically illiquid, speculative, and suitable only for investors who can afford to lose their investment. Past returns displayed do not guarantee future performance. Always do your own research and consult a financial advisor if needed.",
  },
];

// ---------------------------------------------------------------------------
// Page (Server Component — fetches live counts from Prisma)
// ---------------------------------------------------------------------------

export default async function HomePage() {
  let opportunityCount = 9;
  let platformCount = 3;

  try {
    const [opps, plats] = await Promise.all([
      prisma.opportunity.count({ where: { status: "ACTIVE" } }),
      prisma.platform.count({ where: { isActive: true } }),
    ]);
    opportunityCount = opps;
    platformCount = plats;
  } catch {
    // DB unreachable at build/render time — use fallback values
  }

  return (
    <div className="bg-[#0A0A0B] text-white overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
        {/* Animated radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-[#D4A853]/8 blur-[120px] animate-pulse" />
          <div className="absolute left-1/4 top-1/3 h-[300px] w-[300px] rounded-full bg-blue-500/5 blur-[100px]" />
          <div className="absolute right-1/4 bottom-1/3 h-[250px] w-[250px] rounded-full bg-purple-500/5 blur-[100px]" />
        </div>

        {/* Grain overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
            backgroundRepeat: "repeat",
            backgroundSize: "128px 128px",
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4A853]/30 bg-[#D4A853]/8 px-4 py-1.5 text-xs font-medium text-[#D4A853] mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D4A853] animate-pulse" />
            Now aggregating 75+ platforms worldwide
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
            Invest in What Was{" "}
            <span className="text-[#D4A853]">Once Impossible</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-[#A1A1AA] max-w-2xl mx-auto mb-10 leading-relaxed">
            ZITRUM brings you alternative investments from 75+ platforms
            worldwide — tokenized real estate, startup equity, private credit,
            and more. Starting at $10.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link
              href="/feed"
              className="inline-flex items-center gap-2 bg-[#D4A853] hover:bg-[#C49843] text-black font-bold px-8 py-4 rounded-[6px] text-base transition-colors shadow-[0_0_30px_rgba(212,168,83,0.25)] hover:shadow-[0_0_40px_rgba(212,168,83,0.35)]"
            >
              Explore Opportunities
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-2 border border-[#27272A] hover:border-[#D4A853]/50 text-white hover:text-[#D4A853] font-semibold px-8 py-4 rounded-[6px] text-base transition-colors"
            >
              Create Free Account
            </Link>
          </div>

          <p className="text-xs text-[#52525B]">
            No credit card required. Free forever.
          </p>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[#52525B]">
          <div className="h-8 w-px bg-gradient-to-b from-transparent to-[#52525B]" />
        </div>
      </section>

      {/* ── LOGOS BAR ────────────────────────────────────────────────────── */}
      <section className="border-y border-[#27272A] py-8 bg-[#0A0A0B]">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#52525B] mb-6">
            Aggregating from leading platforms
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {PLATFORMS.map((name, i) => (
              <span key={name} className="flex items-center gap-8">
                <span className="text-sm font-medium text-[#52525B] hover:text-[#A1A1AA] transition-colors cursor-default">
                  {name}
                </span>
                {i < PLATFORMS.length - 1 && (
                  <span className="h-1 w-1 rounded-full bg-[#27272A]" aria-hidden />
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#D4A853] mb-3">
              Simple by design
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              How ZITRUM Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connecting dotted line (desktop only) */}
            <div
              aria-hidden
              className="hidden md:block absolute top-10 left-[calc(33.33%+16px)] right-[calc(33.33%+16px)] border-t border-dashed border-[#27272A]"
            />

            {HOW_IT_WORKS.map(({ step, icon: Icon, title, description }) => (
              <div
                key={step}
                className="relative flex flex-col items-center text-center bg-[#1A1A1D] border border-[#27272A] rounded-lg p-8 hover:border-[#D4A853]/30 transition-colors"
              >
                {/* Step number */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0A0A0B] px-2">
                  <span className="text-xs font-bold text-[#D4A853]/60 tracking-widest">
                    {step}
                  </span>
                </div>

                {/* Icon */}
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#D4A853]/10 border border-[#D4A853]/20">
                  <Icon className="h-6 w-6 text-[#D4A853]" />
                </div>

                <h3 className="text-base font-semibold text-white mb-3">{title}</h3>
                <p className="text-sm text-[#A1A1AA] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ASSET CATEGORIES ─────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-[#0D0D0F]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#D4A853] mb-3">
              Six asset classes
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Every Type of Alternative Investment
            </h2>
            <p className="mt-4 text-[#A1A1AA] max-w-xl mx-auto">
              From tokenized bricks-and-mortar to startup rounds — discover
              opportunities that were once only available to the ultra-wealthy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ASSET_CATEGORIES.map(({ key, icon: Icon, title, description, color, bg, border }) => (
              <Link
                key={key}
                href={`/feed?assetTypes=${key}`}
                className={`group flex items-start gap-4 bg-[#1A1A1D] border border-[#27272A] ${border} rounded-lg p-5 transition-all hover:bg-[#1F1F22]`}
              >
                <div className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-lg ${bg} border border-current/10`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-[#D4A853] transition-colors">
                    {title}
                  </h3>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed">{description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 border-y border-[#27272A]">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-[#D4A853] mb-2">
                {opportunityCount}+
              </div>
              <div className="text-sm text-[#A1A1AA] font-medium">
                Live Opportunities
              </div>
            </div>
            <div className="sm:border-x border-[#27272A] px-8">
              <div className="text-5xl font-bold text-[#D4A853] mb-2">
                {platformCount}
              </div>
              <div className="text-sm text-[#A1A1AA] font-medium">
                Integrated Platforms
              </div>
            </div>
            <div>
              <div className="text-5xl font-bold text-[#D4A853] mb-2">6</div>
              <div className="text-sm text-[#A1A1AA] font-medium">
                Asset Classes
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#D4A853] mb-3">
              Common questions
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <Accordion className="divide-y divide-[#27272A]">
            {FAQ_ITEMS.map(({ value, question, answer }) => (
              <AccordionItem
                key={value}
                value={value}
                className="border-0 py-1"
              >
                <AccordionTrigger className="text-white hover:no-underline hover:text-[#D4A853] py-4 text-sm font-medium text-left">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="text-[#A1A1AA] text-sm leading-relaxed pb-4">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-3xl text-center relative">
          {/* Glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-[#D4A853]/6 blur-[100px]"
          />
          <div className="relative z-10 border border-[#27272A] rounded-xl bg-[#1A1A1D] p-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to discover your{" "}
              <span className="text-[#D4A853]">next investment?</span>
            </h2>
            <p className="text-[#A1A1AA] mb-8">
              Join thousands of investors discovering alternatives.
            </p>

            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-2 bg-[#D4A853] hover:bg-[#C49843] text-black font-bold px-8 py-4 rounded-[6px] text-base transition-colors shadow-[0_0_30px_rgba(212,168,83,0.2)]"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-[#52525B]">
              {["Free to browse", "No credit card", "No financial advice"].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-[#22C55E]" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
