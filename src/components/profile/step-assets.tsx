"use client";

import { Building2, Rocket, CreditCard, Palette, Wheat, BarChart3, Check } from "lucide-react";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ASSET_TYPES = [
  {
    value: "REAL_ESTATE",
    icon: Building2,
    title: "Real Estate",
    description: "Tokenized rental properties, REITs, and real estate funds",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    selectedBorder: "border-blue-500/60",
    selectedRing: "ring-blue-500/20",
  },
  {
    value: "STARTUP_EQUITY",
    icon: Rocket,
    title: "Startup Equity",
    description: "Early-stage company equity via Reg CF and angel rounds",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    selectedBorder: "border-purple-500/60",
    selectedRing: "ring-purple-500/20",
  },
  {
    value: "PRIVATE_CREDIT",
    icon: CreditCard,
    title: "Private Credit",
    description: "Fixed-income instruments, SME loans, and private debt",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    selectedBorder: "border-amber-500/60",
    selectedRing: "ring-amber-500/20",
  },
  {
    value: "ART_COLLECTIBLES",
    icon: Palette,
    title: "Art & Collectibles",
    description: "Fractional ownership of fine art, luxury goods, and rare items",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    selectedBorder: "border-pink-500/60",
    selectedRing: "ring-pink-500/20",
  },
  {
    value: "FARMLAND",
    icon: Wheat,
    title: "Farmland",
    description: "Agricultural land investments with crop income and land appreciation",
    color: "text-green-400",
    bg: "bg-green-500/10",
    selectedBorder: "border-green-500/60",
    selectedRing: "ring-green-500/20",
  },
  {
    value: "PRIVATE_EQUITY",
    icon: BarChart3,
    title: "Private Equity",
    description: "Institutional-grade fund exposure and late-stage company stakes",
    color: "text-teal-400",
    bg: "bg-teal-500/10",
    selectedBorder: "border-teal-500/60",
    selectedRing: "ring-teal-500/20",
  },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface StepAssetsProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StepAssets({ selected, onChange }: StepAssetsProps) {
  function toggle(value: string) {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  }

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#D4A853] mb-2">
          Step 3 of 5
        </p>
        <h2 className="text-2xl font-bold text-white mb-2">What interests you?</h2>
        <p className="text-[#A1A1AA] text-sm">
          Select all asset classes you&apos;d like to explore. You must choose at least one.
        </p>
      </div>

      {/* Selection count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#A1A1AA]">
          {selected.length === 0
            ? "None selected — pick at least one to continue"
            : `${selected.length} of 6 selected`}
        </p>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-[#52525B] hover:text-[#A1A1AA] transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ASSET_TYPES.map(({ value, icon: Icon, title, description, color, bg, selectedBorder, selectedRing }) => {
          const isSelected = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => toggle(value)}
              className={`relative flex items-start gap-4 rounded-lg border p-4 text-left transition-all ${
                isSelected
                  ? `${bg} ${selectedBorder} ring-1 ${selectedRing}`
                  : "bg-[#1A1A1D] border-[#27272A] hover:border-[#52525B] hover:bg-[#1F1F22]"
              }`}
            >
              {/* Check indicator */}
              <div
                className={`absolute top-3 right-3 h-5 w-5 rounded-full border flex items-center justify-center transition-all ${
                  isSelected
                    ? "bg-[#D4A853] border-[#D4A853]"
                    : "border-[#27272A] bg-transparent"
                }`}
              >
                {isSelected && <Check className="h-3 w-3 text-black" strokeWidth={3} />}
              </div>

              {/* Icon */}
              <div className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-lg ${bg} border border-current/10`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>

              {/* Text */}
              <div className="pr-6">
                <p className={`font-semibold text-sm mb-1 ${isSelected ? "text-white" : "text-white"}`}>
                  {title}
                </p>
                <p className="text-xs text-[#A1A1AA] leading-relaxed">{description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {selected.length === 0 && (
        <p className="text-center text-xs text-[#EF4444]">
          Please select at least one asset class to continue.
        </p>
      )}
    </div>
  );
}
