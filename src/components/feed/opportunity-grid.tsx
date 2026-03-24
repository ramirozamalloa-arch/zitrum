import { prisma } from "@/lib/prisma";
import type { AssetType, RiskLevel, Prisma } from "@prisma/client";
import { OpportunityCard } from "@/components/feed/opportunity-card";
import { SlidersHorizontal } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GridFilters {
  assetTypes: string[];
  riskLevels: string[];
  minInvestmentMax: number;
  expectedReturnMin: number;
  region: string;
  sort: string;
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#1A1A1D] border border-[#27272A]">
        <SlidersHorizontal className="h-8 w-8 text-[#52525B]" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        No opportunities match your filters
      </h3>
      <p className="text-sm text-[#A1A1AA] max-w-sm">
        {hasFilters
          ? "Try adjusting your filters or check back later for new listings."
          : "No investment opportunities are available right now. Check back soon."}
      </p>
      {hasFilters && (
        <a
          href="/feed"
          className="mt-6 inline-flex items-center gap-2 rounded-[6px] bg-[#D4A853] hover:bg-[#C49843] text-black text-sm font-semibold px-4 py-2 transition-colors"
        >
          Clear Filters
        </a>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// OpportunityGrid — Server Component
// ---------------------------------------------------------------------------

export async function OpportunityGrid({ filters }: { filters: GridFilters }) {
  const {
    assetTypes,
    riskLevels,
    minInvestmentMax,
    expectedReturnMin,
    region,
    sort,
  } = filters;

  const hasFilters =
    assetTypes.length > 0 ||
    riskLevels.length > 0 ||
    minInvestmentMax < 50000 ||
    expectedReturnMin > 0 ||
    !!region;

  // Build the WHERE clause
  const where: Prisma.OpportunityWhereInput = {
    status: "ACTIVE",
    ...(assetTypes.length > 0 && {
      assetType: { in: assetTypes as AssetType[] },
    }),
    ...(riskLevels.length > 0 && {
      riskLevel: { in: riskLevels as RiskLevel[] },
    }),
    ...(minInvestmentMax < 50000 && {
      minInvestment: { lte: minInvestmentMax },
    }),
    ...(expectedReturnMin > 0 && {
      expectedReturnMin: { gte: expectedReturnMin },
    }),
    ...(region && {
      OR: [
        { locationCountry: { contains: region, mode: "insensitive" } },
        { locationCity:    { contains: region, mode: "insensitive" } },
      ],
    }),
  };

  // Build the ORDER BY clause
  const orderByMap: Record<string, Prisma.OpportunityOrderByWithRelationInput> = {
    newest:          { createdAt: "desc" },
    "highest-return": { expectedReturnMax: "desc" },
    "lowest-minimum": { minInvestment: "asc" },
  };
  const orderBy = orderByMap[sort] ?? { createdAt: "desc" };

  const opportunities = await prisma.opportunity.findMany({
    where,
    orderBy,
    include: { platform: true },
  });

  if (opportunities.length === 0) {
    return <EmptyState hasFilters={hasFilters} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {opportunities.map((opp) => (
        <OpportunityCard key={opp.id} opportunity={opp} />
      ))}
    </div>
  );
}
