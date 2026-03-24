"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ---------------------------------------------------------------------------
// Country data — popular countries first, then rest alphabetically
// ---------------------------------------------------------------------------

const PRIORITY_COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia",
  "Germany", "France", "Singapore", "Netherlands",
];

const ALL_COUNTRIES = [
  ...PRIORITY_COUNTRIES,
  "Argentina", "Austria", "Belgium", "Brazil", "Chile", "China",
  "Colombia", "Denmark", "Egypt", "Finland", "Greece", "Hong Kong",
  "India", "Indonesia", "Ireland", "Israel", "Italy", "Japan",
  "Malaysia", "Mexico", "New Zealand", "Nigeria", "Norway", "Pakistan",
  "Philippines", "Poland", "Portugal", "Romania", "Saudi Arabia",
  "South Africa", "South Korea", "Spain", "Sweden", "Switzerland",
  "Thailand", "Turkey", "UAE", "Ukraine", "Vietnam",
];

const AGE_RANGES = ["18-24", "25-34", "35-44", "45-54", "55+"];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface StepAboutData {
  displayName: string;
  ageRange: string;
  country: string;
}

interface StepAboutProps {
  data: StepAboutData;
  onChange: (data: StepAboutData) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StepAbout({ data, onChange }: StepAboutProps) {
  const [countryQuery, setCountryQuery] = useState(data.country);
  const [countryOpen, setCountryOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);

  const filteredCountries = ALL_COUNTRIES.filter((c) =>
    c.toLowerCase().includes(countryQuery.toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectCountry(country: string) {
    setCountryQuery(country);
    onChange({ ...data, country });
    setCountryOpen(false);
  }

  return (
    <div className="space-y-8">
      {/* Intro */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#D4A853] mb-2">
          Step 1 of 5
        </p>
        <h2 className="text-2xl font-bold text-white mb-2">
          Let&apos;s personalize your investment feed
        </h2>
        <p className="text-[#A1A1AA] text-sm">
          Tell us a bit about yourself so we can tailor your experience.
          All fields are optional.
        </p>
      </div>

      {/* Display name */}
      <div className="space-y-2">
        <Label htmlFor="displayName" className="text-sm font-medium text-white">
          What should we call you?
        </Label>
        <Input
          id="displayName"
          placeholder="e.g. Alex, Investor123…"
          value={data.displayName}
          onChange={(e) => onChange({ ...data, displayName: e.target.value })}
          className="bg-[#0A0A0B] border-[#27272A] text-white placeholder:text-[#52525B] focus-visible:ring-[#D4A853] h-11"
        />
      </div>

      {/* Age range */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-white">Age range</Label>
        <div className="flex flex-wrap gap-2">
          {AGE_RANGES.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => onChange({ ...data, ageRange: data.ageRange === range ? "" : range })}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                data.ageRange === range
                  ? "bg-[#D4A853]/15 border-[#D4A853] text-[#D4A853]"
                  : "bg-transparent border-[#27272A] text-[#A1A1AA] hover:border-[#52525B] hover:text-white"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Country — searchable dropdown */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-white">
          Country <span className="text-[#EF4444]">*</span>
        </Label>
        <div ref={countryRef} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52525B] pointer-events-none" />
            <input
              type="text"
              placeholder="Search your country…"
              value={countryQuery}
              onChange={(e) => {
                setCountryQuery(e.target.value);
                onChange({ ...data, country: "" });
                setCountryOpen(true);
              }}
              onFocus={() => setCountryOpen(true)}
              className="w-full h-11 pl-9 pr-10 rounded-md border border-[#27272A] bg-[#0A0A0B] text-white placeholder:text-[#52525B] text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A853]"
            />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#52525B] pointer-events-none" />
          </div>

          {countryOpen && filteredCountries.length > 0 && (
            <ul className="absolute z-50 mt-1 w-full max-h-52 overflow-y-auto rounded-md border border-[#27272A] bg-[#1A1A1D] py-1 shadow-xl">
              {/* Divider after priority countries */}
              {filteredCountries.slice(0, PRIORITY_COUNTRIES.length).map((c) => (
                <li key={c}>
                  <button
                    type="button"
                    onMouseDown={() => selectCountry(c)}
                    className={`w-full px-3 py-2 text-sm text-left transition-colors ${
                      data.country === c
                        ? "bg-[#D4A853]/15 text-[#D4A853]"
                        : "text-white hover:bg-[#27272A]"
                    }`}
                  >
                    {c}
                  </button>
                </li>
              ))}
              {filteredCountries.length > PRIORITY_COUNTRIES.length && (
                <li className="border-t border-[#27272A] my-1" />
              )}
              {filteredCountries.slice(PRIORITY_COUNTRIES.length).map((c) => (
                <li key={c}>
                  <button
                    type="button"
                    onMouseDown={() => selectCountry(c)}
                    className={`w-full px-3 py-2 text-sm text-left transition-colors ${
                      data.country === c
                        ? "bg-[#D4A853]/15 text-[#D4A853]"
                        : "text-white hover:bg-[#27272A]"
                    }`}
                  >
                    {c}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {data.country && (
          <p className="text-xs text-[#22C55E] flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
            {data.country} selected
          </p>
        )}
      </div>
    </div>
  );
}
