"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";

export function BookmarkButton({ opportunityId }: { opportunityId: string }) {
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <button
      onClick={() => setBookmarked((b) => !b)}
      aria-label={bookmarked ? "Remove bookmark" : "Save opportunity"}
      title={bookmarked ? "Saved" : "Save for later"}
      className={`inline-flex items-center gap-2 px-4 py-3 rounded-[6px] border text-sm font-medium transition-colors ${
        bookmarked
          ? "bg-[#D4A853]/10 border-[#D4A853]/40 text-[#D4A853]"
          : "bg-transparent border-[#27272A] text-[#A1A1AA] hover:border-[#D4A853]/40 hover:text-[#D4A853]"
      }`}
      // opportunityId available for future save-to-DB wiring
      data-id={opportunityId}
    >
      <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
      {bookmarked ? "Saved" : "Save"}
    </button>
  );
}
