import Image from "next/image";
import Link from "next/link";
import { Sparkles, MapPin, TrendingUp, DollarSign } from "lucide-react";
import { MatchBadge } from "@/components/feed/match-badge";
import type { OpportunityWithPlatform } from "@/components/feed/opportunity-card";
import type { MatchResult } from "@/lib/matching/engine";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ScoredOpportunity = {
  opportunity: OpportunityWithPlatform;
  match: MatchResult;
};

// ---------------------------------------------------------------------------
// Helpers (duplicated from opportunity-card to avoid client-side import)
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
  return `$${value}`;
}

function formatReturn(min: number | null, max: number | null): string {
  if (min == null && max == null) return "—";
  if (min != null && max != null) return `${min.toFixed(1)}%–${max.toFixed(1)}%`;
  if (min != null) return `${min.toFixed(1)}%+`;
  return `Up to ${max!.toFixed(1)}%`;
}

const ASSET_LABEL: Record<string, string> = {
  REAL_ESTATE:      "Real Estate",
  STARTUP_EQUITY:   "Startup Equity",
  PRIVATE_CREDIT:   "Private Credit",
  ART_COLLECTIBLES: "Art & Collectibles",
  FARMLAND:         "Farmland",
  PRIVATE_EQUITY:   "Private Equity",
};

// ---------------------------------------------------------------------------
// FeaturedCard — compact horizontal card for the top-picks strip
// ---------------------------------------------------------------------------

function FeaturedCard({ item }: { item: ScoredOpportunity }) {
  const { opportunity: opp, match } = item;
  const location = [opp.locationCity, opp.locationCountry].filter(Boolean).join(", ");

  return (
    <article className="relative flex flex-col min-w-[260px] max-w-[300px] w-[280px] shrink-0 bg-[#1A1A1D] border border-[#27272A] rounded-lg overflow-hidden hover:border-[#D4A853]/50 hover:shadow-[0_0_20px_rgba(212,168,83,0.08)] transition-all duration-200 group">
      {/* Image */}
      <div className="relative h-36 bg-[#0A0A0B]">
        <Image
          src={opp.imageUrl ?? `https://placehold.co/600x300/1A1A1D/D4A853?text=${encodeURIComponent(opp.title)}`}
          alt={opp.title}
          fill
          sizes="300px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Asset type badge */}
        <span className="absolute top-2 left-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold bg-[#0A0A0B]/80 backdrop-blur-sm text-[#A1A1AA] border border-[#27272A]">
          {ASSET_LABEL[opp.assetType] ?? opp.assetType}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        {/* Match badge */}
        <MatchBadge score={match.score} breakdown={match.breakdown} />

        {/* Title */}
        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">
          {opp.title}
        </h3>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <div className="flex items-center gap-1 text-[#A1A1AA]">
            <DollarSign className="h-3 w-3 shrink-0" />
            <span>Min. {formatCurrency(opp.minInvestment)}</span>
          </div>
          <div className="flex items-center gap-1 text-[#22C55E]">
            <TrendingUp className="h-3 w-3 shrink-0" />
            <span>{formatReturn(opp.expectedReturnMin, opp.expectedReturnMax)}</span>
          </div>
        </div>

        {location && (
          <div className="flex items-center gap-1 text-[10px] text-[#52525B]">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}

        {/* CTA */}
        <Link
          href={`/opportunity/${opp.id}`}
          className="mt-auto block w-full rounded-[6px] bg-[#D4A853]/10 hover:bg-[#D4A853]/20 border border-[#D4A853]/30 text-[#D4A853] text-xs font-semibold text-center py-1.5 transition-colors"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// TopPicksSection
// ---------------------------------------------------------------------------

interface TopPicksSectionProps {
  picks: ScoredOpportunity[];
}

export function TopPicksSection({ picks }: TopPicksSectionProps) {
  if (picks.length === 0) return null;

  return (
    <section className="mb-10">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-[#D4A853]" />
        <h2 className="text-base font-semibold text-white">Top Picks for You</h2>
        <span className="text-xs text-[#52525B] ml-1">Based on your investor profile</span>
      </div>

      {/* Horizontal scroll on mobile, plain row on desktop */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#27272A]">
        {picks.map((item) => (
          <FeaturedCard key={item.opportunity.id} item={item} />
        ))}
      </div>

      <p className="mt-3 text-[10px] text-[#52525B]">
        Match scores are informational only. ZITRUM does not provide financial advice.
      </p>
    </section>
  );
}
