"use client";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const SECTORS = [
  { value: "Technology",     emoji: "💻" },
  { value: "Healthcare",     emoji: "🏥" },
  { value: "Energy",         emoji: "⚡" },
  { value: "Finance",        emoji: "💳" },
  { value: "Real Estate",    emoji: "🏢" },
  { value: "Agriculture",    emoji: "🌾" },
  { value: "Entertainment",  emoji: "🎬" },
  { value: "Education",      emoji: "📚" },
  { value: "Manufacturing",  emoji: "🏭" },
  { value: "Transportation", emoji: "🚀" },
  { value: "Sustainability", emoji: "🌿" },
  { value: "Food & Beverage",emoji: "🍽️"  },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface StepSectorsProps {
  selected: string[];
  onChange: (selected: string[]) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StepSectors({ selected, onChange }: StepSectorsProps) {
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
          Step 4 of 5
        </p>
        <h2 className="text-2xl font-bold text-white mb-2">
          Pick the sectors you&apos;re passionate about
        </h2>
        <p className="text-[#A1A1AA] text-sm">
          We&apos;ll prioritize opportunities from these sectors in your feed.
          Skip if you&apos;re open to everything.
        </p>
      </div>

      {/* Selection count */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#A1A1AA]">
          {selected.length === 0 ? "None selected — all sectors shown" : `${selected.length} selected`}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onChange(SECTORS.map((s) => s.value))}
            className="text-xs text-[#A1A1AA] hover:text-white transition-colors"
          >
            Select all
          </button>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs text-[#52525B] hover:text-[#A1A1AA] transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Chip grid */}
      <div className="flex flex-wrap gap-2.5">
        {SECTORS.map(({ value, emoji }) => {
          const isSelected = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => toggle(value)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-all ${
                isSelected
                  ? "bg-[#D4A853] border-[#D4A853] text-black shadow-[0_0_12px_rgba(212,168,83,0.25)]"
                  : "bg-[#1A1A1D] border-[#27272A] text-[#A1A1AA] hover:border-[#52525B] hover:text-white"
              }`}
            >
              <span aria-hidden>{emoji}</span>
              {value}
            </button>
          );
        })}
      </div>

      {/* Selected preview */}
      {selected.length > 0 && (
        <div className="rounded-lg bg-[#D4A853]/5 border border-[#D4A853]/20 px-4 py-3">
          <p className="text-xs text-[#D4A853] font-medium">
            Your feed will prioritize: {selected.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}
