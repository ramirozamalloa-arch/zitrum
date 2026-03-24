"use client";

import { useState } from "react";
import type { MatchResult } from "@/lib/matching/engine";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function badgeClasses(score: number): string {
  if (score >= 80) return "bg-green-500/20 text-green-400 border-green-500/30";
  if (score >= 60) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
}

function barColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-[#D4A853]";
  return "bg-zinc-500";
}

// ---------------------------------------------------------------------------
// MatchBadge — shows score pill + expandable breakdown
// ---------------------------------------------------------------------------

interface MatchBadgeProps {
  score: number;
  breakdown: MatchResult["breakdown"];
  /** If true, render compactly (no "Why?" link, no breakdown) */
  compact?: boolean;
}

export function MatchBadge({ score, breakdown, compact = false }: MatchBadgeProps) {
  const [open, setOpen] = useState(false);
  const canExpand = !compact && score >= 60;

  return (
    <div>
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border ${badgeClasses(score)}`}
        >
          {score}% Match
        </span>

        {canExpand && (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="text-[10px] text-[#A1A1AA] hover:text-white transition-colors underline underline-offset-2 leading-none"
          >
            {open ? "Hide details" : "Why this match?"}
          </button>
        )}
      </div>

      {open && canExpand && (
        <div className="mt-2 rounded-md bg-[#0A0A0B] border border-[#27272A] p-3 space-y-2.5">
          {breakdown.map((d) => (
            <div key={d.dimension}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-[#A1A1AA]">{d.dimension}</span>
                <span className="text-[10px] font-semibold text-white">{d.score}/100</span>
              </div>
              <div className="h-1 rounded-full bg-[#27272A] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${barColor(d.score)}`}
                  style={{ width: `${d.score}%` }}
                />
              </div>
              <p className="text-[9px] text-[#52525B] mt-0.5 leading-relaxed">{d.reason}</p>
            </div>
          ))}
          <p className="text-[9px] text-[#52525B] border-t border-[#27272A] pt-2 mt-1">
            Match scores are informational only and do not constitute financial advice.
          </p>
        </div>
      )}
    </div>
  );
}
