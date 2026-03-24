import Link from "next/link";
import { Bookmark, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { OpportunityCard } from "@/components/feed/opportunity-card";
import { OpportunityCardSkeleton } from "@/components/feed/opportunity-card";

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#1A1A1D] border border-[#27272A]">
        <Bookmark className="h-8 w-8 text-[#52525B]" />
      </div>
      <h2 className="text-lg font-semibold text-white mb-2">No saved opportunities yet</h2>
      <p className="text-sm text-[#A1A1AA] max-w-sm mb-8">
        Browse the feed and click the bookmark icon on any opportunity to save it here for later.
      </p>
      <Link
        href="/feed"
        className="inline-flex items-center gap-2 rounded-[6px] bg-[#D4A853] hover:bg-[#C49843] text-black text-sm font-semibold px-5 py-2.5 transition-colors"
      >
        Browse the Feed
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton grid
// ---------------------------------------------------------------------------

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <OpportunityCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page — Server Component (middleware guarantees auth)
// ---------------------------------------------------------------------------

export default async function SavedPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Middleware guarantees user is non-null here, but be defensive
  if (!user) return <GridSkeleton />;

  const saved = await prisma.savedOpportunity.findMany({
    where: { userId: user.id },
    include: {
      opportunity: {
        include: { platform: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const opportunities = saved.map((s) => s.opportunity);

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Saved Opportunities</h1>
          <p className="mt-1 text-sm text-[#A1A1AA]">
            {opportunities.length === 0
              ? "Your saved list is empty."
              : `${opportunities.length} saved ${opportunities.length === 1 ? "opportunity" : "opportunities"}`}
          </p>
        </div>

        {opportunities.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                initialSaved={true}
              />
            ))}
          </div>
        )}

        <p className="mt-12 text-center text-xs text-[#52525B]">
          ZITRUM does not provide financial advice. All investments carry risk.
        </p>
      </div>
    </div>
  );
}
