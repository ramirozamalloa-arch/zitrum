"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";

interface BookmarkButtonProps {
  opportunityId: string;
  initialSaved?: boolean;
}

export function BookmarkButton({ opportunityId, initialSaved = false }: BookmarkButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);

  async function handleToggle() {
    if (pending) return;
    setPending(true);
    const next = !saved;
    setSaved(next); // optimistic

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId }),
      });

      if (!res.ok) throw new Error("Request failed");

      const data = await res.json() as { saved: boolean };
      setSaved(data.saved);
      toast(data.saved ? "Saved to your list" : "Removed from saved");
    } catch {
      setSaved(!next); // revert
      toast.error("Could not update bookmark. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={pending}
      aria-label={saved ? "Remove bookmark" : "Save opportunity"}
      title={saved ? "Saved" : "Save for later"}
      className={`inline-flex items-center gap-2 px-4 py-3 rounded-[6px] border text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
        saved
          ? "bg-[#D4A853]/10 border-[#D4A853]/40 text-[#D4A853]"
          : "bg-transparent border-[#27272A] text-[#A1A1AA] hover:border-[#D4A853]/40 hover:text-[#D4A853]"
      }`}
    >
      <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
      {saved ? "Saved" : "Save"}
    </button>
  );
}
