import type { InvestorProfile, Opportunity } from "@prisma/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MatchDimension = {
  dimension: string;
  score: number;   // 0–100 for this dimension
  weight: number;  // 0–1
  reason: string;  // human-readable explanation
};

export type MatchResult = {
  score: number;   // 0–100 weighted total
  breakdown: MatchDimension[];
};

// ---------------------------------------------------------------------------
// Asset type → loosely related sectors
// ---------------------------------------------------------------------------

const ASSET_SECTOR_MAP: Record<string, string[]> = {
  REAL_ESTATE:      ["Real Estate"],
  STARTUP_EQUITY:   ["Technology", "Healthcare", "Energy", "Finance", "Entertainment", "Education", "Transportation", "Sustainability"],
  PRIVATE_CREDIT:   ["Finance"],
  ART_COLLECTIBLES: ["Entertainment"],
  FARMLAND:         ["Agriculture", "Food & Beverage", "Sustainability"],
  PRIVATE_EQUITY:   ["Finance", "Technology", "Healthcare", "Energy", "Manufacturing"],
};

// ---------------------------------------------------------------------------
// Dimension 1 — Asset Type Match (weight: 0.25)
// ---------------------------------------------------------------------------

function scoreAssetType(profile: InvestorProfile, opp: Opportunity): MatchDimension {
  const weight = 0.25;
  const interested = profile.interestedAssetTypes;
  const matched = interested.length === 0 || interested.includes(opp.assetType);
  const readableType = opp.assetType.replace(/_/g, " ").toLowerCase();

  return {
    dimension: "Asset type",
    score: matched ? 100 : 20,
    weight,
    reason: matched
      ? `${readableType} is among your selected asset classes`
      : `${readableType} is outside your stated asset interests`,
  };
}

// ---------------------------------------------------------------------------
// Dimension 2 — Investment Range (weight: 0.20)
// ---------------------------------------------------------------------------

function scoreInvestmentRange(profile: InvestorProfile, opp: Opportunity): MatchDimension {
  const weight = 0.20;
  const min = opp.minInvestment;
  const capMin = profile.availableCapitalMin ?? 0;
  const capMax = profile.availableCapitalMax ?? Infinity;

  let score: number;
  let reason: string;

  if (capMax === Infinity && capMin === 0) {
    score = 70;
    reason = "No capital range set — assuming this fits your budget";
  } else if (min >= capMin && min <= capMax) {
    score = 100;
    reason = `Min. $${min.toLocaleString()} fits within your $${capMin.toLocaleString()}–$${capMax.toLocaleString()} range`;
  } else if (min <= capMax * 2) {
    score = 60;
    reason = `Min. $${min.toLocaleString()} is a stretch — within 2× your stated maximum`;
  } else {
    score = 10;
    reason = `Min. $${min.toLocaleString()} is well above your available capital range`;
  }

  return { dimension: "Investment range", score, weight, reason };
}

// ---------------------------------------------------------------------------
// Dimension 3 — Risk Compatibility (weight: 0.20)
// ---------------------------------------------------------------------------

const RISK_ORDER = ["LOW", "MEDIUM", "HIGH"] as const;
type RiskLevel = (typeof RISK_ORDER)[number];

function toleranceToPreferredRisks(tol: number): RiskLevel[] {
  if (tol <= 2) return ["LOW"];
  if (tol === 3) return ["LOW", "MEDIUM"];
  if (tol === 4) return ["MEDIUM", "HIGH"];
  return ["HIGH"];
}

function scoreRisk(profile: InvestorProfile, opp: Opportunity): MatchDimension {
  const weight = 0.20;
  const tol = profile.riskTolerance ?? 3;
  const preferred = toleranceToPreferredRisks(tol);
  const oppRisk = opp.riskLevel as RiskLevel;

  const oppIdx = RISK_ORDER.indexOf(oppRisk);
  const minDist = Math.min(...preferred.map((r) => Math.abs(RISK_ORDER.indexOf(r) - oppIdx)));

  let score: number;
  let reason: string;

  if (minDist === 0) {
    score = 100;
    reason = `${oppRisk.toLowerCase()} risk perfectly aligns with your risk tolerance`;
  } else if (minDist === 1) {
    score = 50;
    reason = `${oppRisk.toLowerCase()} risk is one level away from your preference`;
  } else {
    score = 15;
    reason = `${oppRisk.toLowerCase()} risk is significantly outside your comfort zone`;
  }

  return { dimension: "Risk compatibility", score, weight, reason };
}

// ---------------------------------------------------------------------------
// Dimension 4 — Region Match (weight: 0.15)
// ---------------------------------------------------------------------------

function scoreRegion(profile: InvestorProfile, opp: Opportunity): MatchDimension {
  const weight = 0.15;
  const country = opp.locationCountry ?? "";
  const regions = profile.interestedRegions;

  if (regions.length === 0) {
    return {
      dimension: "Region",
      score: 70,
      weight,
      reason: "No region preference set — open to global opportunities",
    };
  }

  const matched = regions.some(
    (r) =>
      country.toLowerCase().includes(r.toLowerCase()) ||
      r.toLowerCase().includes(country.toLowerCase())
  );

  return {
    dimension: "Region",
    score: matched ? 100 : 40,
    weight,
    reason: matched
      ? `${country || "This region"} is among your preferred investment regions`
      : "Outside your preferred regions — still a discovery opportunity",
  };
}

// ---------------------------------------------------------------------------
// Dimension 5 — Return vs Horizon (weight: 0.10)
// ---------------------------------------------------------------------------

function scoreReturnHorizon(profile: InvestorProfile, opp: Opportunity): MatchDimension {
  const weight = 0.10;
  const horizon = profile.investmentHorizon ?? "MEDIUM";
  const ret = opp.expectedReturnMax ?? opp.expectedReturnMin ?? 0;

  let score: number;
  let reason: string;

  if (horizon === "SHORT") {
    if (ret >= 15) { score = 100; reason = `${ret}% return is excellent for a short-horizon strategy`; }
    else if (ret >= 10) { score = 70; reason = `${ret}% return is solid for a short-horizon strategy`; }
    else { score = 40; reason = `${ret}% return is modest for a short-term investment`; }
  } else if (horizon === "LONG") {
    if (ret >= 10) { score = 100; reason = `${ret}% return is strong and suits a long-term hold`; }
    else { score = 80; reason = "Steady returns suit a long-term compounding strategy"; }
  } else {
    // MEDIUM
    if (ret >= 10) { score = 100; reason = `${ret}% return is excellent for a medium-horizon strategy`; }
    else if (ret >= 5) { score = 70; reason = `${ret}% return is reasonable for a medium horizon`; }
    else { score = 50; reason = `${ret}% return is conservative for a medium-term investment`; }
  }

  return { dimension: "Return vs horizon", score, weight, reason };
}

// ---------------------------------------------------------------------------
// Dimension 6 — Sector Match (weight: 0.10)
// ---------------------------------------------------------------------------

function scoreSector(profile: InvestorProfile, opp: Opportunity): MatchDimension {
  const weight = 0.10;
  const relatedSectors = ASSET_SECTOR_MAP[opp.assetType] ?? [];
  const interested = profile.interestedSectors;

  if (interested.length === 0) {
    return {
      dimension: "Sector",
      score: 70,
      weight,
      reason: "No sector preference set — open to all sectors",
    };
  }

  const matched = relatedSectors.some((s) => interested.includes(s));

  return {
    dimension: "Sector",
    score: matched ? 100 : 30,
    weight,
    reason: matched
      ? "Related to one or more of your preferred sectors"
      : "Not directly tied to your preferred sectors",
  };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function calculateMatchScore(
  profile: InvestorProfile,
  opportunity: Opportunity
): MatchResult {
  const dimensions = [
    scoreAssetType(profile, opportunity),
    scoreInvestmentRange(profile, opportunity),
    scoreRisk(profile, opportunity),
    scoreRegion(profile, opportunity),
    scoreReturnHorizon(profile, opportunity),
    scoreSector(profile, opportunity),
  ];

  const score = Math.round(
    dimensions.reduce((sum, d) => sum + d.score * d.weight, 0)
  );

  return { score, breakdown: dimensions };
}
