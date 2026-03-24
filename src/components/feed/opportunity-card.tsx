"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Bookmark, TrendingUp, DollarSign, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { Opportunity, Platform } from "@prisma/client";
import { MatchBadge } from "@/components/feed/match-badge";
import type { MatchResult } from "@/lib/matching/engine";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type OpportunityWithPlatform = Opportunity & { platform: Platform };

// ---------------------------------------------------------------------------
// Config maps
// ---------------------------------------------------------------------------

const ASSET_TYPE_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  REAL_ESTATE:      { label: "Real Estate",       bg: "bg-blue-500/20",   text: "text-blue-400"   },
  STARTUP_EQUITY:   { label: "Startup Equity",     bg: "bg-purple-500/20", text: "text-purple-400" },
  PRIVATE_CREDIT:   { label: "Private Credit",     bg: "bg-amber-500/20",  text: "text-amber-400"  },
  ART_COLLECTIBLES: { label: "Art & Collectibles", bg: "bg-pink-500/20",   text: "text-pink-400"   },
  FARMLAND:         { label: "Farmland",           bg: "bg-green-500/20",  text: "text-green-400"  },
  PRIVATE_EQUITY:   { label: "Private Equity",     bg: "bg-teal-500/20",   text: "text-teal-400"   },
};

const RISK_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  LOW:    { label: "Low Risk",    bg: "bg-green-500/20",  text: "text-green-400"  },
  MEDIUM: { label: "Medium Risk", bg: "bg-yellow-500/20", text: "text-yellow-400" },
  HIGH:   { label: "High Risk",   bg: "bg-red-500/20",    text: "text-red-400"    },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number, currency = "USD"): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}k`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatReturn(min: number | null, max: number | null): string {
  if (min == null && max == null) return "—";
  if (min != null && max != null) return `${min.toFixed(1)}%–${max.toFixed(1)}%`;
  if (min != null) return `${min.toFixed(1)}%+`;
  return `Up to ${max!.toFixed(1)}%`;
}

// ---------------------------------------------------------------------------
// OpportunityCard
// ---------------------------------------------------------------------------

interface OpportunityCardProps {
  opportunity: OpportunityWithPlatform;
  matchScore?: number;
  matchBreakdown?: MatchResult["breakdown"];
  initialSaved?: boolean;
}

export function OpportunityCard({
  opportunity,
  matchScore,
  matchBreakdown,
  initialSaved = false,
}: OpportunityCardProps) {
  const [bookmarked, setBookmarked] = useState(initialSaved);
  const [bookmarkPending, setBookmarkPending] = useState(false);

  async function handleBookmark() {
    if (bookmarkPending) return;
    setBookmarkPending(true);
    const next = !bookmarked;
    setBookmarked(next); // optimistic

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId: opportunity.id }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json() as { saved: boolean };
      setBookmarked(data.saved);
      toast(data.saved ? "Saved to your list" : "Removed from saved");
    } catch {
      setBookmarked(!next); // revert
      toast.error("Could not update bookmark. Try again.");
    } finally {
      setBookmarkPending(false);
    }
  }

  const assetCfg = ASSET_TYPE_CONFIG[opportunity.assetType] ?? {
    label: opportunity.assetType,
    bg: "bg-zinc-500/20",
    text: "text-zinc-400",
  };
  const riskCfg = RISK_CONFIG[opportunity.riskLevel] ?? {
    label: opportunity.riskLevel,
    bg: "bg-zinc-500/20",
    text: "text-zinc-400",
  };

  const location = [opportunity.locationCity, opportunity.locationCountry]
    .filter(Boolean)
    .join(", ");

  return (
    <article className="group flex flex-col bg-[#1A1A1D] border border-[#27272A] rounded-lg overflow-hidden transition-all duration-200 hover:border-[#D4A853]/50 hover:shadow-[0_0_20px_rgba(212,168,83,0.08)]">
      {/* Image */}
      <div className="relative aspect-video bg-[#0A0A0B]">
        <Image
          src={opportunity.imageUrl ?? `https://placehold.co/800x400/1A1A1D/D4A853?text=${encodeURIComponent(opportunity.title)}`}
          alt={opportunity.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Asset type badge — top left */}
        <span
          className={`absolute top-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm ${assetCfg.bg} ${assetCfg.text} border border-current/20`}
        >
          {assetCfg.label}
        </span>

        {/* Risk badge — top right */}
        <span
          className={`absolute top-2 right-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold backdrop-blur-sm ${riskCfg.bg} ${riskCfg.text} border border-current/20`}
        >
          {riskCfg.label}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Platform */}
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-[#27272A] flex items-center justify-center overflow-hidden shrink-0">
            {opportunity.platform.logoUrl ? (
              <Image
                src={opportunity.platform.logoUrl}
                alt={opportunity.platform.name}
                width={20}
                height={20}
                className="object-contain"
              />
            ) : (
              <span className="text-[8px] font-bold text-[#D4A853]">
                {opportunity.platform.name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <span className="text-xs text-[#A1A1AA]">{opportunity.platform.name}</span>
        </div>

        {/* Match badge (only when a score is provided) */}
        {matchScore !== undefined && matchBreakdown !== undefined && (
          <MatchBadge score={matchScore} breakdown={matchBreakdown} />
        )}

        {/* Title */}
        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">
          {opportunity.title}
        </h3>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md bg-[#0A0A0B] px-3 py-2">
            <div className="flex items-center gap-1 mb-0.5">
              <DollarSign className="h-3 w-3 text-[#A1A1AA]" />
              <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wide">Min. Investment</span>
            </div>
            <span className="text-sm font-semibold text-white">
              {formatCurrency(opportunity.minInvestment, opportunity.currency)}
            </span>
          </div>
          <div className="rounded-md bg-[#0A0A0B] px-3 py-2">
            <div className="flex items-center gap-1 mb-0.5">
              <TrendingUp className="h-3 w-3 text-[#A1A1AA]" />
              <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wide">Est. Return</span>
            </div>
            <span className="text-sm font-semibold text-[#22C55E]">
              {formatReturn(opportunity.expectedReturnMin, opportunity.expectedReturnMax)}
            </span>
          </div>
        </div>

        {/* Location */}
        {location && (
          <div className="flex items-center gap-1.5 text-xs text-[#A1A1AA]">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <Link
            href={`/opportunity/${opportunity.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#D4A853] hover:text-[#C49843] transition-colors"
          >
            View Details
            <ExternalLink className="h-3 w-3" />
          </Link>

          <button
            onClick={handleBookmark}
            disabled={bookmarkPending}
            aria-label={bookmarked ? "Remove bookmark" : "Bookmark opportunity"}
            className={`p-1.5 rounded-md transition-colors disabled:opacity-50 ${
              bookmarked
                ? "text-[#D4A853] bg-[#D4A853]/10"
                : "text-[#52525B] hover:text-[#A1A1AA] hover:bg-[#27272A]"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Skeleton card (used while loading)
// ---------------------------------------------------------------------------

export function OpportunityCardSkeleton() {
  return (
    <div className="flex flex-col bg-[#1A1A1D] border border-[#27272A] rounded-lg overflow-hidden animate-pulse">
      <div className="aspect-video bg-[#27272A]" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-[#27272A]" />
          <div className="h-3 w-16 rounded bg-[#27272A]" />
        </div>
        <div className="h-4 w-3/4 rounded bg-[#27272A]" />
        <div className="h-3 w-1/2 rounded bg-[#27272A]" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-14 rounded-md bg-[#27272A]" />
          <div className="h-14 rounded-md bg-[#27272A]" />
        </div>
        <div className="h-3 w-1/3 rounded bg-[#27272A]" />
        <div className="flex justify-between pt-1">
          <div className="h-4 w-20 rounded bg-[#27272A]" />
          <div className="h-6 w-6 rounded bg-[#27272A]" />
        </div>
      </div>
    </div>
  );
}
