"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Sidebar, type FeedFilters } from "@/components/layout/sidebar";

// Reads current filters from URL search params and bridges them
// into the Sidebar component, pushing updates back to the URL on apply.
export function FeedSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentFilters: FeedFilters = {
    assetTypes: searchParams.get("assetTypes")?.split(",").filter(Boolean) ?? [],
    riskLevels: searchParams.get("riskLevels")?.split(",").filter(Boolean) ?? [],
    minInvestmentMax: Number(searchParams.get("minInvestmentMax") ?? 50000),
    expectedReturnMin: Number(searchParams.get("expectedReturnMin") ?? 0),
    region: searchParams.get("region") ?? "",
  };

  function applyFilters(filters: FeedFilters) {
    const params = new URLSearchParams(searchParams.toString());

    if (filters.assetTypes.length > 0) {
      params.set("assetTypes", filters.assetTypes.join(","));
    } else {
      params.delete("assetTypes");
    }

    if (filters.riskLevels.length > 0) {
      params.set("riskLevels", filters.riskLevels.join(","));
    } else {
      params.delete("riskLevels");
    }

    if (filters.minInvestmentMax < 50000) {
      params.set("minInvestmentMax", String(filters.minInvestmentMax));
    } else {
      params.delete("minInvestmentMax");
    }

    if (filters.expectedReturnMin > 0) {
      params.set("expectedReturnMin", String(filters.expectedReturnMin));
    } else {
      params.delete("expectedReturnMin");
    }

    if (filters.region) {
      params.set("region", filters.region);
    } else {
      params.delete("region");
    }

    router.push(`/feed?${params.toString()}`);
  }

  return (
    <Sidebar
      // key forces the Sidebar to re-initialize draft state when URL params change
      key={searchParams.toString()}
      filters={currentFilters}
      onApply={applyFilters}
    />
  );
}
