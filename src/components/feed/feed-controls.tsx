"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { MobileFilterButton } from "@/components/layout/sidebar";
import type { FeedFilters } from "@/components/layout/sidebar";

const SORT_OPTIONS = [
  { value: "newest",          label: "Newest" },
  { value: "highest-return",  label: "Highest Return" },
  { value: "lowest-minimum",  label: "Lowest Minimum" },
];

interface FeedControlsProps {
  totalCount: number;
  currentSort: string;
  currentFilters: FeedFilters;
}

export function FeedControls({ totalCount, currentSort, currentFilters }: FeedControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSortChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    router.push(`/feed?${params.toString()}`);
  }

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
    <div className="flex items-center justify-between gap-4 mb-6">
      <p className="text-sm text-[#A1A1AA] shrink-0">
        Showing{" "}
        <span className="text-white font-medium">{totalCount}</span>{" "}
        {totalCount === 1 ? "opportunity" : "opportunities"}
      </p>

      <div className="flex items-center gap-3">
        {/* Mobile filter button — only visible below lg */}
        <MobileFilterButton filters={currentFilters} onApply={applyFilters} />

        {/* Sort dropdown */}
        <div className="relative">
          <select
            value={currentSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="appearance-none cursor-pointer rounded-md border border-[#27272A] bg-[#1A1A1D] pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#D4A853]"
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                Sort: {label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1A1AA]" />
        </div>
      </div>
    </div>
  );
}
