"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FeedFilters {
  assetTypes: string[];
  riskLevels: string[];
  minInvestmentMax: number;
  expectedReturnMin: number;
  region: string;
}

interface SidebarProps {
  filters: FeedFilters;
  onApply: (filters: FeedFilters) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ASSET_TYPE_OPTIONS = [
  { value: "REAL_ESTATE", label: "Real Estate" },
  { value: "STARTUP_EQUITY", label: "Startup Equity" },
  { value: "PRIVATE_CREDIT", label: "Private Credit" },
  { value: "ART_COLLECTIBLES", label: "Art & Collectibles" },
  { value: "FARMLAND", label: "Farmland" },
  { value: "PRIVATE_EQUITY", label: "Private Equity" },
];

const RISK_LEVEL_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

const REGIONS = [
  "Global",
  "North America",
  "Latin America",
  "Europe",
  "Asia Pacific",
  "Middle East",
  "Africa",
];

const DEFAULT_FILTERS: FeedFilters = {
  assetTypes: [],
  riskLevels: [],
  minInvestmentMax: 50000,
  expectedReturnMin: 0,
  region: "",
};

// ---------------------------------------------------------------------------
// Shared filter panel content
// ---------------------------------------------------------------------------

function FilterPanel({
  draft,
  setDraft,
  onApply,
  onClear,
}: {
  draft: FeedFilters;
  setDraft: (f: FeedFilters) => void;
  onApply: () => void;
  onClear: () => void;
}) {
  function toggleList(key: "assetTypes" | "riskLevels", value: string) {
    const current = draft[key];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setDraft({ ...draft, [key]: next });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Asset Type */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-3">
          Asset Type
        </h3>
        <div className="space-y-2.5">
          {ASSET_TYPE_OPTIONS.map(({ value, label }) => (
            <div key={value} className="flex items-center gap-2.5">
              <Checkbox
                id={`asset-${value}`}
                checked={draft.assetTypes.includes(value)}
                onCheckedChange={() => toggleList("assetTypes", value)}
                className="border-[#52525B] data-[state=checked]:bg-[#D4A853] data-[state=checked]:border-[#D4A853]"
              />
              <Label
                htmlFor={`asset-${value}`}
                className="text-sm text-[#A1A1AA] cursor-pointer hover:text-white transition-colors"
              >
                {label}
              </Label>
            </div>
          ))}
        </div>
      </section>

      <Separator className="bg-[#27272A]" />

      {/* Min Investment */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-3">
          Min Investment
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-[#A1A1AA]">
            <span>$0</span>
            <span className="text-white font-medium">
              ${draft.minInvestmentMax.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={50000}
            step={500}
            value={draft.minInvestmentMax}
            onChange={(e) =>
              setDraft({ ...draft, minInvestmentMax: Number(e.target.value) })
            }
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer
              bg-[#27272A] accent-[#D4A853]"
          />
          <div className="flex justify-between text-xs text-[#52525B]">
            <span>$0</span>
            <span>$50,000</span>
          </div>
        </div>
      </section>

      <Separator className="bg-[#27272A]" />

      {/* Expected Return */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-3">
          Expected Return (min)
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-[#A1A1AA]">
            <span>0%</span>
            <span className="text-white font-medium">{draft.expectedReturnMin}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={30}
            step={1}
            value={draft.expectedReturnMin}
            onChange={(e) =>
              setDraft({ ...draft, expectedReturnMin: Number(e.target.value) })
            }
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer
              bg-[#27272A] accent-[#D4A853]"
          />
          <div className="flex justify-between text-xs text-[#52525B]">
            <span>0%</span>
            <span>30%</span>
          </div>
        </div>
      </section>

      <Separator className="bg-[#27272A]" />

      {/* Risk Level */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-3">
          Risk Level
        </h3>
        <div className="space-y-2.5">
          {RISK_LEVEL_OPTIONS.map(({ value, label }) => (
            <div key={value} className="flex items-center gap-2.5">
              <Checkbox
                id={`risk-${value}`}
                checked={draft.riskLevels.includes(value)}
                onCheckedChange={() => toggleList("riskLevels", value)}
                className="border-[#52525B] data-[state=checked]:bg-[#D4A853] data-[state=checked]:border-[#D4A853]"
              />
              <Label
                htmlFor={`risk-${value}`}
                className="text-sm text-[#A1A1AA] cursor-pointer hover:text-white transition-colors"
              >
                {label}
              </Label>
            </div>
          ))}
        </div>
      </section>

      <Separator className="bg-[#27272A]" />

      {/* Region */}
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] mb-3">
          Region
        </h3>
        <select
          value={draft.region}
          onChange={(e) => setDraft({ ...draft, region: e.target.value })}
          className="w-full rounded-md border border-[#27272A] bg-[#0A0A0B] px-3 py-2
            text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#D4A853]"
        >
          <option value="">All Regions</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </section>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-2">
        <Button
          onClick={onApply}
          className="w-full bg-[#D4A853] hover:bg-[#C49843] text-black font-semibold rounded-[6px]"
        >
          Apply Filters
        </Button>
        <button
          onClick={onClear}
          className="w-full text-sm text-[#A1A1AA] hover:text-white transition-colors py-1"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Desktop sidebar
// ---------------------------------------------------------------------------

export function Sidebar({ filters, onApply }: SidebarProps) {
  const [draft, setDraft] = useState<FeedFilters>(filters);

  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-24 bg-[#1A1A1D] border border-[#27272A] rounded-lg p-5">
        <h2 className="text-sm font-semibold text-white mb-5">Filters</h2>
        <FilterPanel
          draft={draft}
          setDraft={setDraft}
          onApply={() => onApply(draft)}
          onClear={() => {
            setDraft(DEFAULT_FILTERS);
            onApply(DEFAULT_FILTERS);
          }}
        />
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Mobile filter sheet trigger
// ---------------------------------------------------------------------------

export function MobileFilterButton({ filters, onApply }: SidebarProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FeedFilters>(filters);

  const activeCount =
    filters.assetTypes.length +
    filters.riskLevels.length +
    (filters.minInvestmentMax < 50000 ? 1 : 0) +
    (filters.expectedReturnMin > 0 ? 1 : 0) +
    (filters.region ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="lg:hidden inline-flex items-center gap-2 border border-[#27272A] bg-[#1A1A1D] text-white hover:bg-[#27272A] rounded-md px-3 py-2 text-sm font-medium transition-colors">
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {activeCount > 0 && (
          <span className="ml-1 inline-flex items-center justify-center rounded-full bg-[#D4A853] text-black text-xs font-semibold w-5 h-5">
            {activeCount}
          </span>
        )}
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="bg-[#0A0A0B] border-t border-[#27272A] px-6 pt-6 pb-8 max-h-[85vh] overflow-y-auto rounded-t-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-white">Filters</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-[#A1A1AA] hover:text-white"
            aria-label="Close filters"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <FilterPanel
          draft={draft}
          setDraft={setDraft}
          onApply={() => {
            onApply(draft);
            setOpen(false);
          }}
          onClear={() => {
            setDraft(DEFAULT_FILTERS);
            onApply(DEFAULT_FILTERS);
            setOpen(false);
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
