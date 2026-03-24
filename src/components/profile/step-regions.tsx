"use client";

import { Leaf } from "lucide-react";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const REGION_GROUPS = [
  {
    label: "North America",
    countries: ["United States", "Canada", "Mexico"],
  },
  {
    label: "Europe",
    countries: ["United Kingdom", "Germany", "France", "Spain", "Netherlands"],
  },
  {
    label: "Asia-Pacific",
    countries: ["Singapore", "Australia", "Japan", "India"],
  },
  {
    label: "Latin America",
    countries: ["Brazil", "Argentina", "Colombia"],
  },
  {
    label: "Middle East & Africa",
    countries: ["UAE", "South Africa", "Nigeria"],
  },
];

// Flat list of all regions (used for "select all" in a group)
const ALL_REGIONS = REGION_GROUPS.flatMap((g) => g.countries);

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface StepRegionsProps {
  selected: string[];
  esg: boolean;
  onRegionsChange: (regions: string[]) => void;
  onEsgChange: (esg: boolean) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StepRegions({ selected, esg, onRegionsChange, onEsgChange }: StepRegionsProps) {
  function toggleRegion(region: string) {
    onRegionsChange(
      selected.includes(region)
        ? selected.filter((r) => r !== region)
        : [...selected, region]
    );
  }

  function toggleGroup(countries: string[]) {
    const allSelected = countries.every((c) => selected.includes(c));
    if (allSelected) {
      onRegionsChange(selected.filter((r) => !countries.includes(r)));
    } else {
      const toAdd = countries.filter((c) => !selected.includes(c));
      onRegionsChange([...selected, ...toAdd]);
    }
  }

  const totalSelected = selected.length;

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#D4A853] mb-2">
          Step 5 of 5
        </p>
        <h2 className="text-2xl font-bold text-white mb-2">Where do you want to invest?</h2>
        <p className="text-[#A1A1AA] text-sm">
          Select regions and markets of interest. Leave blank to see global opportunities.
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#A1A1AA]">
          {totalSelected === 0 ? "All regions shown" : `${totalSelected} markets selected`}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onRegionsChange([...ALL_REGIONS])}
            className="text-xs text-[#A1A1AA] hover:text-white transition-colors"
          >
            Select all
          </button>
          {totalSelected > 0 && (
            <button
              type="button"
              onClick={() => onRegionsChange([])}
              className="text-xs text-[#52525B] hover:text-[#A1A1AA] transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Region groups */}
      <div className="space-y-4">
        {REGION_GROUPS.map(({ label, countries }) => {
          const groupAllSelected = countries.every((c) => selected.includes(c));
          const groupSomeSelected = countries.some((c) => selected.includes(c));

          return (
            <div key={label} className="bg-[#1A1A1D] border border-[#27272A] rounded-lg overflow-hidden">
              {/* Group header */}
              <button
                type="button"
                onClick={() => toggleGroup(countries)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#222224] transition-colors"
              >
                <span className="text-sm font-semibold text-white">{label}</span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border transition-all ${
                    groupAllSelected
                      ? "bg-[#D4A853]/15 border-[#D4A853]/50 text-[#D4A853]"
                      : groupSomeSelected
                      ? "bg-[#D4A853]/8 border-[#D4A853]/20 text-[#D4A853]/70"
                      : "bg-transparent border-[#27272A] text-[#52525B]"
                  }`}
                >
                  {groupAllSelected
                    ? "All selected"
                    : groupSomeSelected
                    ? `${countries.filter((c) => selected.includes(c)).length}/${countries.length}`
                    : "Select all"}
                </span>
              </button>

              {/* Country checkboxes */}
              <div className="px-4 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 border-t border-[#27272A]">
                {countries.map((country) => {
                  const checked = selected.includes(country);
                  return (
                    <button
                      key={country}
                      type="button"
                      onClick={() => toggleRegion(country)}
                      className={`flex items-center gap-2.5 rounded-md px-2 py-2 text-sm text-left transition-colors ${
                        checked ? "text-white" : "text-[#A1A1AA] hover:text-white"
                      }`}
                    >
                      {/* Custom checkbox */}
                      <span
                        className={`inline-flex h-4 w-4 shrink-0 rounded border items-center justify-center transition-all ${
                          checked
                            ? "bg-[#D4A853] border-[#D4A853]"
                            : "bg-transparent border-[#52525B]"
                        }`}
                      >
                        {checked && (
                          <svg viewBox="0 0 10 8" className="h-2.5 w-2.5 fill-black" aria-hidden>
                            <path d="M1 4l3 3 5-6" stroke="black" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      {country}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ESG toggle */}
      <div
        className={`flex items-start gap-4 rounded-lg border p-4 cursor-pointer transition-all ${
          esg
            ? "bg-green-500/10 border-green-500/40"
            : "bg-[#1A1A1D] border-[#27272A] hover:border-[#52525B]"
        }`}
        onClick={() => onEsgChange(!esg)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === " " && onEsgChange(!esg)}
      >
        <div
          className={`mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full border transition-all ${
            esg ? "bg-green-500 border-green-500" : "bg-[#27272A] border-[#27272A]"
          }`}
        >
          <span
            className={`h-3.5 w-3.5 rounded-full bg-white shadow transition-transform mx-0.5 ${
              esg ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Leaf className={`h-4 w-4 ${esg ? "text-green-400" : "text-[#A1A1AA]"}`} />
            <p className={`text-sm font-semibold ${esg ? "text-green-400" : "text-white"}`}>
              ESG / Impact Investing
            </p>
          </div>
          <p className="text-xs text-[#A1A1AA]">
            Show me ESG-focused and socially responsible investment opportunities
          </p>
        </div>
      </div>
    </div>
  );
}
