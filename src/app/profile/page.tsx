export const dynamic = 'force-dynamic';

import Link from "next/link";
import { redirect } from "next/navigation";
import {
  User,
  Pencil,
  Calendar,
  Bookmark,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  MapPin,
  Briefcase,
  Leaf,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
  return `$${value}`;
}

function riskLabel(tol: number | null): string {
  const map: Record<number, string> = {
    1: "Very Conservative",
    2: "Conservative",
    3: "Moderate",
    4: "Aggressive",
    5: "Very Aggressive",
  };
  return tol ? (map[tol] ?? "—") : "—";
}

function horizonLabel(h: string | null): string {
  const map: Record<string, string> = {
    SHORT:  "Short (< 2 years)",
    MEDIUM: "Medium (2–5 years)",
    LONG:   "Long (5+ years)",
  };
  return h ? (map[h] ?? h) : "—";
}

function assetLabel(a: string): string {
  const map: Record<string, string> = {
    REAL_ESTATE:      "Real Estate",
    STARTUP_EQUITY:   "Startup Equity",
    PRIVATE_CREDIT:   "Private Credit",
    ART_COLLECTIBLES: "Art & Collectibles",
    FARMLAND:         "Farmland",
    PRIVATE_EQUITY:   "Private Equity",
  };
  return map[a] ?? a;
}

// ---------------------------------------------------------------------------
// Section card
// ---------------------------------------------------------------------------

function Section({ title, icon, children }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-[#1A1A1D] border border-[#27272A] rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[#D4A853]">{icon}</span>
        <h2 className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// No-profile state
// ---------------------------------------------------------------------------

function NoProfile() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#1A1A1D] border border-[#27272A]">
        <User className="h-8 w-8 text-[#52525B]" />
      </div>
      <h2 className="text-lg font-semibold text-white mb-2">Profile not set up yet</h2>
      <p className="text-sm text-[#A1A1AA] max-w-sm mb-8">
        Complete your investor profile to get personalized match scores and a tailored feed.
      </p>
      <Link
        href="/onboarding"
        className="inline-flex items-center gap-2 rounded-[6px] bg-[#D4A853] hover:bg-[#C49843] text-black text-sm font-semibold px-5 py-2.5 transition-colors"
      >
        <Pencil className="h-4 w-4" />
        Set Up Profile
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page — Server Component (middleware guarantees auth)
// ---------------------------------------------------------------------------

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/sign-in");

  const [profile, savedCount] = await Promise.all([
    prisma.investorProfile.findUnique({ where: { userId: user.id } }),
    prisma.savedOpportunity.count({ where: { userId: user.id } }),
  ]);

  const displayName =
    (user.user_metadata?.full_name as string | undefined) ??
    profile?.displayName ??
    null;

  const memberSince = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Profile header ──────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[#1A1A1D] border border-[#27272A] flex items-center justify-center shrink-0">
              <span className="text-xl font-bold text-[#D4A853]">
                {(displayName ?? user.email ?? "?").slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                {displayName ?? "Investor"}
              </h1>
              <p className="text-sm text-[#A1A1AA]">{user.email}</p>
              {profile?.country && (
                <p className="text-xs text-[#52525B] mt-0.5">{profile.country}</p>
              )}
            </div>
          </div>

          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 rounded-[6px] border border-[#27272A] hover:bg-[#1A1A1D] text-white text-sm font-medium px-4 py-2 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Profile
          </Link>
        </div>

        {/* ── Stats strip ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          <div className="bg-[#1A1A1D] border border-[#27272A] rounded-lg px-4 py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="h-3.5 w-3.5 text-[#A1A1AA]" />
              <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wide">Member since</span>
            </div>
            <span className="text-sm font-semibold text-white">{memberSince}</span>
          </div>
          <div className="bg-[#1A1A1D] border border-[#27272A] rounded-lg px-4 py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Bookmark className="h-3.5 w-3.5 text-[#A1A1AA]" />
              <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wide">Saved</span>
            </div>
            <Link href="/saved" className="text-sm font-semibold text-[#D4A853] hover:text-[#C49843] transition-colors">
              {savedCount} {savedCount === 1 ? "opportunity" : "opportunities"}
            </Link>
          </div>
          <div className="bg-[#1A1A1D] border border-[#27272A] rounded-lg px-4 py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Briefcase className="h-3.5 w-3.5 text-[#A1A1AA]" />
              <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wide">Asset classes</span>
            </div>
            <span className="text-sm font-semibold text-white">
              {profile?.interestedAssetTypes.length ?? 0} selected
            </span>
          </div>
        </div>

        {/* ── Profile body ──────────────────────────────────────────────────── */}
        {!profile ? (
          <NoProfile />
        ) : (
          <div className="space-y-4">

            {/* Capital & Goals */}
            <Section title="Capital & Goals" icon={<DollarSign className="h-4 w-4" />}>
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <dt className="text-xs text-[#52525B] mb-1">Capital range</dt>
                  <dd className="text-sm font-semibold text-white">
                    {profile.availableCapitalMin != null && profile.availableCapitalMax != null
                      ? `${formatCurrency(profile.availableCapitalMin)} – ${formatCurrency(profile.availableCapitalMax)}`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#52525B] mb-1">Investment horizon</dt>
                  <dd className="text-sm font-semibold text-white">
                    {horizonLabel(profile.investmentHorizon)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#52525B] mb-1">Risk tolerance</dt>
                  <dd className="text-sm font-semibold text-white">
                    {riskLabel(profile.riskTolerance)}
                    {profile.riskTolerance != null && (
                      <span className="ml-1 text-[#A1A1AA] font-normal text-xs">
                        ({profile.riskTolerance}/5)
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </Section>

            {/* Asset Classes */}
            <Section title="Asset Classes" icon={<TrendingUp className="h-4 w-4" />}>
              {profile.interestedAssetTypes.length === 0 ? (
                <p className="text-sm text-[#52525B]">None selected</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.interestedAssetTypes.map((a) => (
                    <span
                      key={a}
                      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-[#D4A853]/10 border border-[#D4A853]/20 text-[#D4A853]"
                    >
                      {assetLabel(a)}
                    </span>
                  ))}
                </div>
              )}
            </Section>

            {/* Sectors */}
            {profile.interestedSectors.length > 0 && (
              <Section title="Preferred Sectors" icon={<Briefcase className="h-4 w-4" />}>
                <div className="flex flex-wrap gap-2">
                  {profile.interestedSectors.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-[#27272A] text-[#A1A1AA]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* Regions */}
            {profile.interestedRegions.length > 0 && (
              <Section title="Preferred Regions" icon={<MapPin className="h-4 w-4" />}>
                <div className="flex flex-wrap gap-2">
                  {profile.interestedRegions.map((r) => (
                    <span
                      key={r}
                      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-[#27272A] text-[#A1A1AA]"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {/* ESG + Risk */}
            <Section title="Preferences" icon={<Leaf className="h-4 w-4" />}>
              <div className="flex items-center gap-3">
                <div className={`relative h-5 w-9 rounded-full transition-colors ${profile.esgPreference ? "bg-[#22C55E]" : "bg-[#27272A]"}`}>
                  <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200 ${profile.esgPreference ? "left-4.5" : "left-0.5"}`} />
                </div>
                <span className="text-sm text-[#A1A1AA]">
                  ESG / sustainable investing{" "}
                  <span className={profile.esgPreference ? "text-[#22C55E]" : "text-[#52525B]"}>
                    {profile.esgPreference ? "enabled" : "disabled"}
                  </span>
                </span>
              </div>
            </Section>

            {/* Risk disclaimer */}
            <p className="text-xs text-[#52525B] text-center pt-2">
              ZITRUM does not provide financial advice. Match scores are informational only.
            </p>
          </div>
        )}

        {/* Missing profile CTA row */}
        {!profile && (
          <div className="mt-4 rounded-lg border border-[#D4A853]/20 bg-[#D4A853]/5 px-5 py-4 text-center">
            <p className="text-sm text-[#A1A1AA]">
              Set up your profile to unlock personalized match scores on the{" "}
              <Link href="/feed" className="text-[#D4A853] hover:underline">feed</Link>.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
