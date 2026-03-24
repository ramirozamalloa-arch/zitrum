import Link from "next/link";
import { Target } from "lucide-react";

export function ProfileBanner() {
  return (
    <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-lg border border-[#D4A853]/30 bg-[#D4A853]/5 px-5 py-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="h-10 w-10 shrink-0 rounded-full bg-[#D4A853]/10 border border-[#D4A853]/30 flex items-center justify-center">
          <Target className="h-5 w-5 text-[#D4A853]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">
            Get personalized matches
          </p>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Complete your investor profile to see opportunities matched to your interests, capital, and goals.
          </p>
        </div>
      </div>
      <Link
        href="/onboarding"
        className="shrink-0 rounded-[6px] bg-[#D4A853] text-black text-sm font-semibold px-4 py-2 hover:bg-[#C49843] transition-colors whitespace-nowrap"
      >
        Set up profile
      </Link>
    </div>
  );
}
