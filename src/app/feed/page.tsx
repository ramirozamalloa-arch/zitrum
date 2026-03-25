export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import type { AssetType, RiskLevel, Prisma } from "@prisma/client";
import { FeedSidebar } from "@/components/feed/feed-sidebar";
import { FeedControls } from "@/components/feed/feed-controls";
import { OpportunityGrid } from "@/components/feed/opportunity-grid";
import { OpportunityCardSkeleton } from "@/components/feed/opportunity-card";
import { ProfileBanner } from "@/components/feed/profile-banner";
import { TopPicksSection } from "@/components/feed/top-picks-section";
import type { GridFilters } from "@/components/feed/opportunity-grid";
import type { FeedFilters } from "@/components/layout/sidebar";
import { calculateMatchScore } from "@/lib/matching/engine";
import type { MatchResult } from "@/lib/matching/engine";
import type { ScoredOpportunity } from "@/components/feed/top-picks-section";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseFilters(params: Record<string, string | string[] | undefined>): {
  gridFilters: GridFilters;
  sidebarFilters: FeedFilters;
  sort: string;
} {
  const get = (key: string) =>
    Array.isArray(params[key]) ? params[key][0] : (params[key] ?? "");

  const assetTypes = get("assetTypes").split(",").filter(Boolean);
  const riskLevels = get("riskLevels").split(",").filter(Boolean);
  const minInvestmentMax = Number(get("minInvestmentMax") || 50000);
  const expectedReturnMin = Number(get("expectedReturnMin") || 0);
  const region = get("region");
  const sort = get("sort") || "newest";

  const sidebarFilters: FeedFilters = {
    assetTypes,
    riskLevels,
    minInvestmentMax,
    expectedReturnMin,
    region,
  };

  return {
    gridFilters: { ...sidebarFilters, sort },
    sidebarFilters,
    sort,
  };
}

async function getOpportunityCount(filters: GridFilters): Promise<number> {
  const { assetTypes, riskLevels, minInvestmentMax, expectedReturnMin, region } = filters;

  const where: Prisma.OpportunityWhereInput = {
    status: "ACTIVE",
    ...(assetTypes.length > 0 && { assetType: { in: assetTypes as AssetType[] } }),
    ...(riskLevels.length > 0 && { riskLevel: { in: riskLevels as RiskLevel[] } }),
    ...(minInvestmentMax < 50000 && { minInvestment: { lte: minInvestmentMax } }),
    ...(expectedReturnMin > 0 && { expectedReturnMin: { gte: expectedReturnMin } }),
    ...(region && {
      OR: [
        { locationCountry: { contains: region, mode: "insensitive" } },
        { locationCity:    { contains: region, mode: "insensitive" } },
      ],
    }),
  };

  return prisma.opportunity.count({ where });
}

/**
 * Fetch profile + run matching engine for all active opportunities.
 * Returns null matchScores if the user has no profile yet.
 */
async function getMatchData(userId: string | null): Promise<{
  hasProfile: boolean;
  matchScores: Record<string, MatchResult> | null;
  topPicks: ScoredOpportunity[];
}> {
  if (!userId) return { hasProfile: false, matchScores: null, topPicks: [] };

  const [profile, opportunities] = await Promise.all([
    prisma.investorProfile.findUnique({ where: { userId } }),
    prisma.opportunity.findMany({
      where: { status: "ACTIVE" },
      include: { platform: true },
    }),
  ]);

  if (!profile) {
    return { hasProfile: false, matchScores: null, topPicks: [] };
  }

  const scored: ScoredOpportunity[] = opportunities
    .map((opp) => ({ opportunity: opp, match: calculateMatchScore(profile, opp) }))
    .sort((a, b) => b.match.score - a.match.score);

  const matchScores: Record<string, MatchResult> = {};
  for (const { opportunity, match } of scored) {
    matchScores[opportunity.id] = match;
  }

  return {
    hasProfile: true,
    matchScores,
    topPicks: scored.slice(0, 3),
  };
}

async function getSavedIds(userId: string | null): Promise<Set<string>> {
  if (!userId) return new Set();
  const saved = await prisma.savedOpportunity.findMany({
    where: { userId },
    select: { opportunityId: true },
  });
  return new Set((saved as Array<{ opportunityId: string }>).map(s => s.opportunityId));
}

// ---------------------------------------------------------------------------
// Skeleton grid
// ---------------------------------------------------------------------------

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <OpportunityCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feed page — Server Component
// ---------------------------------------------------------------------------

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { gridFilters, sidebarFilters, sort } = parseFilters(params);

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id ?? null;

  const [totalCount, { hasProfile, matchScores, topPicks }, savedIds] = await Promise.all([
    getOpportunityCount(gridFilters),
    getMatchData(userId),
    getSavedIds(userId),
  ]);

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Investment Feed</h1>
          <p className="mt-1 text-sm text-[#A1A1AA]">
            Discover alternative investment opportunities from top platforms worldwide.
          </p>
        </div>

        {/* Profile banner — only shown when no profile exists */}
        {!hasProfile && <ProfileBanner />}

        {/* Top Picks — only shown when a profile exists */}
        {hasProfile && topPicks.length > 0 && (
          <TopPicksSection picks={topPicks} />
        )}

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <Suspense fallback={<div className="hidden lg:block w-64 shrink-0" />}>
            <FeedSidebar />
          </Suspense>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Controls: count + sort + mobile filter button */}
            <Suspense fallback={<div className="h-10 mb-6" />}>
              <FeedControls
                totalCount={totalCount}
                currentSort={sort}
                currentFilters={sidebarFilters}
              />
            </Suspense>

            {/* Opportunity grid */}
            <Suspense fallback={<GridSkeleton />}>
              <OpportunityGrid
                filters={gridFilters}
                matchScores={matchScores ?? undefined}
                savedIds={savedIds}
              />
            </Suspense>
          </div>
        </div>

        {/* Legal disclaimer */}
        <p className="mt-12 text-center text-xs text-[#52525B]">
          ZITRUM does not provide financial advice. All investments carry risk.
          Opportunity data is sourced from third-party platforms and may not reflect current availability.
        </p>
      </div>
    </div>
  );
}
