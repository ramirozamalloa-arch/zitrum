export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  ArrowLeft,
  ExternalLink,
  Globe,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Coins,
  ChevronRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { OpportunityCard } from "@/components/feed/opportunity-card";
import { BookmarkButton } from "@/app/opportunity/[id]/bookmark-button";

// ---------------------------------------------------------------------------
// Config maps (mirrors opportunity-card.tsx — kept server-side here)
// ---------------------------------------------------------------------------

const ASSET_TYPE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  REAL_ESTATE:      { label: "Real Estate",       bg: "bg-blue-500/20",   text: "text-blue-400",   border: "border-blue-500/30"   },
  STARTUP_EQUITY:   { label: "Startup Equity",    bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/30" },
  PRIVATE_CREDIT:   { label: "Private Credit",    bg: "bg-amber-500/20",  text: "text-amber-400",  border: "border-amber-500/30"  },
  ART_COLLECTIBLES: { label: "Art & Collectibles",bg: "bg-pink-500/20",   text: "text-pink-400",   border: "border-pink-500/30"   },
  FARMLAND:         { label: "Farmland",          bg: "bg-green-500/20",  text: "text-green-400",  border: "border-green-500/30"  },
  PRIVATE_EQUITY:   { label: "Private Equity",    bg: "bg-teal-500/20",   text: "text-teal-400",   border: "border-teal-500/30"   },
};

const RISK_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; dotColor: string }> = {
  LOW:    { label: "Low Risk",    bg: "bg-green-500/20",  text: "text-green-400",  border: "border-green-500/30",  dotColor: "bg-green-400"  },
  MEDIUM: { label: "Medium Risk", bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30", dotColor: "bg-yellow-400" },
  HIGH:   { label: "High Risk",   bg: "bg-red-500/20",    text: "text-red-400",    border: "border-red-500/30",    dotColor: "bg-red-400"    },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatReturn(min: number | null, max: number | null): string {
  if (min == null && max == null) return "—";
  if (min != null && max != null) return `${min.toFixed(1)}% – ${max.toFixed(1)}%`;
  if (min != null) return `${min.toFixed(1)}%+`;
  return `Up to ${max!.toFixed(1)}%`;
}

function buildInvestUrl(base: string): string {
  try {
    const url = new URL(base);
    url.searchParams.set("utm_source", "zitrum");
    url.searchParams.set("utm_medium", "referral");
    url.searchParams.set("utm_campaign", "detail");
    return url.toString();
  } catch {
    return base;
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function OpportunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch main opportunity
  const opportunity = await prisma.opportunity.findUnique({
    where: { id },
    include: { platform: true },
  });

  if (!opportunity) notFound();

  // Check if current user has saved this opportunity
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const initialSaved = user
    ? !!(await prisma.savedOpportunity.findUnique({
        where: { userId_opportunityId: { userId: user.id, opportunityId: id } },
      }))
    : false;

  const assetCfg = ASSET_TYPE_CONFIG[opportunity.assetType] ?? {
    label: opportunity.assetType, bg: "bg-zinc-500/20", text: "text-zinc-400", border: "border-zinc-500/30",
  };
  const riskCfg = RISK_CONFIG[opportunity.riskLevel] ?? {
    label: opportunity.riskLevel, bg: "bg-zinc-500/20", text: "text-zinc-400", border: "border-zinc-500/30", dotColor: "bg-zinc-400",
  };

  const heroImage =
    opportunity.imageUrl ??
    `https://placehold.co/1200x800/1A1A1D/D4A853?text=${encodeURIComponent(opportunity.title)}`;

  const investUrl = buildInvestUrl(opportunity.externalUrl);

  const location = [opportunity.locationCity, opportunity.locationCountry]
    .filter(Boolean)
    .join(", ");

  // Similar opportunities — same asset type, exclude self; pad with others if needed
  const similar = await prisma.opportunity.findMany({
    where: { assetType: opportunity.assetType, id: { not: id }, status: "ACTIVE" },
    include: { platform: true },
    take: 3,
  });

  if (similar.length < 3) {
    const pad = await prisma.opportunity.findMany({
      where: { id: { notIn: [id, ...similar.map((s) => s.id)] }, status: "ACTIVE" },
      include: { platform: true },
      take: 3 - similar.length,
    });
    similar.push(...pad);
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#0A0A0B]">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative w-full" style={{ maxHeight: 800 }}>
        <div className="relative w-full h-[40vh] sm:h-[55vh] max-h-[800px] bg-[#0A0A0B]">
          <Image
            src={heroImage}
            alt={opportunity.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/30 to-transparent" />

          {/* Asset type badge — top left */}
          <span className={`absolute top-4 left-4 sm:top-6 sm:left-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm border ${assetCfg.bg} ${assetCfg.text} ${assetCfg.border}`}>
            {assetCfg.label}
          </span>

          {/* Risk badge — top right */}
          <span className={`absolute top-4 right-4 sm:top-6 sm:right-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm border ${riskCfg.bg} ${riskCfg.text} ${riskCfg.border}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${riskCfg.dotColor}`} />
            {riskCfg.label}
          </span>

          {/* Platform badge — bottom left */}
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 inline-flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 px-3 py-1.5">
            <div className="h-4 w-4 rounded-full bg-[#27272A] flex items-center justify-center overflow-hidden shrink-0">
              <span className="text-[7px] font-bold text-[#D4A853]">
                {opportunity.platform.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <span className="text-xs font-medium text-white">{opportunity.platform.name}</span>
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">

        {/* Back + breadcrumb */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <Link
            href="/feed"
            className="inline-flex items-center gap-1.5 text-sm text-[#A1A1AA] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Feed
          </Link>

          <nav className="hidden sm:flex items-center gap-1 text-xs text-[#52525B]">
            <Link href="/feed" className="hover:text-[#A1A1AA] transition-colors">Feed</Link>
            <ChevronRight className="h-3 w-3" />
            <span className={`${assetCfg.text}`}>{assetCfg.label}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#A1A1AA] truncate max-w-[200px]">{opportunity.title}</span>
          </nav>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-4">
          {opportunity.title}
        </h1>

        {/* Description */}
        {opportunity.description && (
          <p className="text-[#A1A1AA] leading-relaxed mb-8">
            {opportunity.description}
          </p>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="bg-[#1A1A1D] border border-[#27272A] rounded-lg p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <DollarSign className="h-3.5 w-3.5 text-[#A1A1AA]" />
              <span className="text-xs text-[#A1A1AA] uppercase tracking-wide">Min. Investment</span>
            </div>
            <span className="text-xl font-bold text-white">
              {formatCurrency(opportunity.minInvestment, opportunity.currency)}
            </span>
          </div>

          <div className="bg-[#1A1A1D] border border-[#27272A] rounded-lg p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="h-3.5 w-3.5 text-[#A1A1AA]" />
              <span className="text-xs text-[#A1A1AA] uppercase tracking-wide">Est. Return</span>
            </div>
            <span className="text-xl font-bold text-[#22C55E]">
              {formatReturn(opportunity.expectedReturnMin, opportunity.expectedReturnMax)}
            </span>
          </div>

          <div className="bg-[#1A1A1D] border border-[#27272A] rounded-lg p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <ShieldCheck className="h-3.5 w-3.5 text-[#A1A1AA]" />
              <span className="text-xs text-[#A1A1AA] uppercase tracking-wide">Risk Level</span>
            </div>
            <span className={`text-xl font-bold ${riskCfg.text}`}>
              {opportunity.riskLevel.charAt(0) + opportunity.riskLevel.slice(1).toLowerCase()}
            </span>
          </div>

          <div className="bg-[#1A1A1D] border border-[#27272A] rounded-lg p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Coins className="h-3.5 w-3.5 text-[#A1A1AA]" />
              <span className="text-xs text-[#A1A1AA] uppercase tracking-wide">Currency</span>
            </div>
            <span className="text-xl font-bold text-white">{opportunity.currency}</span>
          </div>
        </div>

        {/* Location */}
        {location && (
          <div className="flex items-center gap-2 text-sm text-[#A1A1AA] mb-8">
            <MapPin className="h-4 w-4 text-[#D4A853] shrink-0" />
            <span>{location}</span>
          </div>
        )}

        {/* ── CTA section ───────────────────────────────────────────────── */}
        <div className="bg-[#1A1A1D] border border-[#27272A] rounded-lg p-6 mb-8">
          <h2 className="text-sm font-semibold text-[#A1A1AA] uppercase tracking-wide mb-4">
            Ready to Invest?
          </h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <a
              href={investUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#D4A853] hover:bg-[#C49843] text-black font-bold px-6 py-3 rounded-[6px] transition-colors text-sm"
            >
              Invest on {opportunity.platform.name}
              <ExternalLink className="h-4 w-4" />
            </a>
            <BookmarkButton opportunityId={opportunity.id} initialSaved={initialSaved} />
          </div>
          <p className="mt-3 text-xs text-[#52525B]">
            You will be redirected to {opportunity.platform.name} to complete your investment.
            ZITRUM does not process transactions or hold funds.
          </p>
        </div>

        {/* ── Platform section ──────────────────────────────────────────── */}
        <div className="bg-[#1A1A1D] border border-[#27272A] rounded-lg p-6 mb-8">
          <p className="text-xs text-[#A1A1AA] uppercase tracking-wide font-semibold mb-4">
            Hosted On
          </p>
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-[#27272A] flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-[#D4A853]">
                {opportunity.platform.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-semibold text-white">{opportunity.platform.name}</h3>
                {opportunity.platform.isActive && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-[10px] font-semibold text-green-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    Active
                  </span>
                )}
              </div>
              {opportunity.platform.description && (
                <p className="text-sm text-[#A1A1AA] leading-relaxed mb-3">
                  {opportunity.platform.description}
                </p>
              )}
              <p className="text-xs text-[#52525B] mb-3">
                This opportunity is hosted on {opportunity.platform.name}. Clicking the invest button
                will take you to their platform where you can review the full offering details and
                complete your investment.
              </p>
              <a
                href={opportunity.platform.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#D4A853] hover:text-[#C49843] transition-colors"
              >
                <Globe className="h-3 w-3" />
                Visit {opportunity.platform.name}
              </a>
            </div>
          </div>
        </div>

        {/* ── Legal disclaimer ──────────────────────────────────────────── */}
        <div className="bg-[#1A1A1D] border border-[#27272A] rounded-lg p-5 mb-12">
          <p className="text-xs text-[#52525B] leading-relaxed">
            <span className="text-[#A1A1AA] font-semibold">Disclaimer: </span>
            ZITRUM does not provide financial advice. All investments carry risk. Please do your own
            research before investing. Past returns do not guarantee future performance. Investment
            opportunities displayed are sourced from third-party platforms. Always review the full
            offering documents on the platform before making any investment decision.
          </p>
        </div>

        {/* ── Similar Opportunities ─────────────────────────────────────── */}
        {similar.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Similar Opportunities</h2>
              <Link
                href={`/feed?assetTypes=${opportunity.assetType}`}
                className="text-xs text-[#D4A853] hover:text-[#C49843] transition-colors"
              >
                View all {assetCfg.label} →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similar.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
