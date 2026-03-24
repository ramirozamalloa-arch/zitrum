"use client";

import { Clock, TrendingUp, Landmark, ShieldCheck } from "lucide-react";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const CAPITAL_PRESETS = [
  { label: "$100 – $1K",  min: 100,   max: 1_000   },
  { label: "$1K – $10K",  min: 1_000,  max: 10_000  },
  { label: "$10K – $50K", min: 10_000, max: 50_000  },
  { label: "$50K+",       min: 50_000, max: 500_000 },
];

const HORIZONS = [
  {
    value: "SHORT",
    icon: Clock,
    title: "Short Term",
    subtitle: "< 1 year",
    description: "Quick returns, liquidity priority",
  },
  {
    value: "MEDIUM",
    icon: TrendingUp,
    title: "Medium Term",
    subtitle: "1 – 5 years",
    description: "Balanced growth and income",
  },
  {
    value: "LONG",
    icon: Landmark,
    title: "Long Term",
    subtitle: "5+ years",
    description: "Wealth building, compounding returns",
  },
];

const RISK_LEVELS = [
  { value: 1, label: "Very Conservative", desc: "Capital preservation first" },
  { value: 2, label: "Conservative",      desc: "Minimal risk, stable returns" },
  { value: 3, label: "Moderate",          desc: "Balanced risk and reward" },
  { value: 4, label: "Aggressive",        desc: "Higher risk for higher returns" },
  { value: 5, label: "Very Aggressive",   desc: "Maximum growth potential" },
];

const RISK_COLORS: Record<number, { bar: string; text: string; bg: string; border: string }> = {
  1: { bar: "bg-green-400",  text: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/50"  },
  2: { bar: "bg-teal-400",   text: "text-teal-400",   bg: "bg-teal-500/10",   border: "border-teal-500/50"   },
  3: { bar: "bg-yellow-400", text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/50" },
  4: { bar: "bg-orange-400", text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/50" },
  5: { bar: "bg-red-400",    text: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/50"    },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface StepCapitalData {
  capitalMin: number;
  capitalMax: number;
  horizon: string;
  riskTolerance: number;
}

interface StepCapitalProps {
  data: StepCapitalData;
  onChange: (data: StepCapitalData) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatAmount(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StepCapital({ data, onChange }: StepCapitalProps) {
  const activePreset = CAPITAL_PRESETS.find(
    (p) => p.min === data.capitalMin && p.max === data.capitalMax
  );

  return (
    <div className="space-y-8">
      {/* Intro */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#D4A853] mb-2">
          Step 2 of 5
        </p>
        <h2 className="text-2xl font-bold text-white mb-2">Your capital & goals</h2>
        <p className="text-[#A1A1AA] text-sm">
          Help us surface opportunities that fit your available budget and timeline.
        </p>
      </div>

      {/* Capital range */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-white">Available investment capital</p>

        {/* Presets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CAPITAL_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() =>
                onChange({ ...data, capitalMin: preset.min, capitalMax: preset.max })
              }
              className={`px-3 py-2 rounded-md text-sm font-medium border transition-all ${
                activePreset?.label === preset.label
                  ? "bg-[#D4A853]/15 border-[#D4A853] text-[#D4A853]"
                  : "bg-[#1A1A1D] border-[#27272A] text-[#A1A1AA] hover:border-[#52525B] hover:text-white"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Manual range inputs */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-xs text-[#A1A1AA] mb-1">Min</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B] text-sm">$</span>
              <input
                type="number"
                min={0}
                max={data.capitalMax}
                value={data.capitalMin || ""}
                onChange={(e) => onChange({ ...data, capitalMin: Number(e.target.value) || 0 })}
                placeholder="0"
                className="w-full h-10 pl-6 pr-3 rounded-md border border-[#27272A] bg-[#0A0A0B] text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A853] placeholder:text-[#52525B]"
              />
            </div>
          </div>
          <span className="text-[#52525B] mt-5">–</span>
          <div className="flex-1">
            <label className="block text-xs text-[#A1A1AA] mb-1">Max</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525B] text-sm">$</span>
              <input
                type="number"
                min={data.capitalMin}
                max={500_000}
                value={data.capitalMax || ""}
                onChange={(e) => onChange({ ...data, capitalMax: Number(e.target.value) || 0 })}
                placeholder="500,000"
                className="w-full h-10 pl-6 pr-3 rounded-md border border-[#27272A] bg-[#0A0A0B] text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A853] placeholder:text-[#52525B]"
              />
            </div>
          </div>
        </div>

        {data.capitalMin > 0 && data.capitalMax > 0 && (
          <p className="text-xs text-[#22C55E]">
            Range: {formatAmount(data.capitalMin)} – {formatAmount(data.capitalMax)}
          </p>
        )}
      </div>

      {/* Investment horizon */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-white">
          Investment horizon <span className="text-[#EF4444]">*</span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {HORIZONS.map(({ value, icon: Icon, title, subtitle, description }) => {
            const selected = data.horizon === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ ...data, horizon: value })}
                className={`flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-all ${
                  selected
                    ? "bg-[#D4A853]/10 border-[#D4A853] ring-1 ring-[#D4A853]/30"
                    : "bg-[#1A1A1D] border-[#27272A] hover:border-[#52525B]"
                }`}
              >
                <div className={`p-1.5 rounded-md ${selected ? "bg-[#D4A853]/20" : "bg-[#27272A]"}`}>
                  <Icon className={`h-4 w-4 ${selected ? "text-[#D4A853]" : "text-[#A1A1AA]"}`} />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${selected ? "text-[#D4A853]" : "text-white"}`}>
                    {title}
                  </p>
                  <p className="text-xs text-[#D4A853]/70 font-medium">{subtitle}</p>
                  <p className="text-xs text-[#A1A1AA] mt-1">{description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Risk tolerance */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-white">
            Risk tolerance <span className="text-[#EF4444]">*</span>
          </p>
          {data.riskTolerance > 0 && (
            <span className={`text-xs font-semibold ${RISK_COLORS[data.riskTolerance].text}`}>
              {RISK_LEVELS[data.riskTolerance - 1].label}
            </span>
          )}
        </div>

        <div className="space-y-2">
          {RISK_LEVELS.map(({ value, label, desc }) => {
            const selected = data.riskTolerance === value;
            const colors = RISK_COLORS[value];
            return (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ ...data, riskTolerance: value })}
                className={`w-full flex items-center gap-4 rounded-lg border p-3.5 text-left transition-all ${
                  selected
                    ? `${colors.bg} ${colors.border} ring-1 ring-current/20`
                    : "bg-[#1A1A1D] border-[#27272A] hover:border-[#52525B]"
                }`}
              >
                {/* Risk bar indicator */}
                <div className="flex items-end gap-0.5 shrink-0">
                  {[1, 2, 3, 4, 5].map((bar) => (
                    <div
                      key={bar}
                      className={`w-1.5 rounded-full transition-all ${
                        bar <= value
                          ? selected ? colors.bar : "bg-[#52525B]"
                          : "bg-[#27272A]"
                      }`}
                      style={{ height: `${6 + bar * 4}px` }}
                    />
                  ))}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${selected ? colors.text : "text-white"}`}>
                    {value}. {label}
                  </p>
                  <p className="text-xs text-[#A1A1AA]">{desc}</p>
                </div>

                {selected && (
                  <ShieldCheck className={`h-4 w-4 shrink-0 ${colors.text}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
