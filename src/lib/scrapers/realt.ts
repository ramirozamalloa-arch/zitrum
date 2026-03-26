import { execSync } from "child_process";
import { AssetType, RiskLevel, OpportunityStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// RealT scraper — uses the community REST API (no auth required for basic fields)
// Full yield data requires an API key from: https://api.realtoken.community/
// ---------------------------------------------------------------------------

const REALT_API_URL = "https://api.realtoken.community/v1/token";
const REALT_BASE_URL = "https://realt.co";

interface RealTokenApiEntry {
  fullName: string;
  shortName: string;
  symbol: string;
  productType: string;
  tokenPrice: number;
  currency: string;
  uuid: string;
  ethereumContract: string | null;
  xDaiContract: string | null;
  gnosisContract: string | null;
  lastUpdate: { date: string };
}

// US state abbreviations used to detect domestic properties
const US_STATES = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
  "DC",
]);

/**
 * Parse location from a RealT fullName string.
 * Examples:
 *   "15777 Ardmore St, Detroit, MI 48227" → { city: "Detroit, MI", country: "US" }
 *   "Villa Marina 514, Playa Venao, Los Santos, Panama" → { city: "Los Santos", country: "Panama" }
 */
function parseLocation(fullName: string): { city: string; country: string } {
  const parts = fullName.split(",").map((p) => p.trim());

  if (parts.length >= 3) {
    const lastPart = parts[parts.length - 1]; // "MI 48227" or "Panama"
    const stateToken = lastPart.trim().split(" ")[0].toUpperCase();

    if (US_STATES.has(stateToken)) {
      const city = parts[parts.length - 2].trim();
      return { city: `${city}, ${stateToken}`, country: "US" };
    }

    // Non-US: last part is the country
    const city = parts[parts.length - 2].trim();
    return { city, country: lastPart.trim() };
  }

  if (parts.length === 2) {
    return { city: parts[1].trim(), country: "US" };
  }

  return { city: fullName, country: "US" };
}

/**
 * Convert a RealT fullName to its marketplace URL slug.
 * "15777 Ardmore St, Detroit, MI 48227" → "15777-ardmore-st-detroit-mi-48227"
 */
function buildSlug(fullName: string): string {
  return fullName
    .toLowerCase()
    .replace(/,/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Determine risk level based on token price (proxy for property tier when yield is unavailable).
 * Without API key, yield data is not available so we default to LOW for all rental properties.
 */
function getRiskLevel(): RiskLevel {
  return RiskLevel.LOW;
}

export async function scrapeRealT(): Promise<{
  platform: string;
  total: number;
  new: number;
  updated: number;
  error?: string;
}> {
  console.log("[RealT] Starting scrape...");

  // Upsert the RealT platform record
  const platform = await prisma.platform.upsert({
    where: { slug: "realt" },
    update: { isActive: true },
    create: {
      name: "RealT",
      slug: "realt",
      website: "https://realt.co",
      logoUrl: "https://placehold.co/120x40/1A1A1D/D4A853?text=RealT",
      description:
        "RealT offers fractional ownership of US rental properties through tokenization on the blockchain. Investors receive daily rental income in stablecoins.",
      assetTypes: ["REAL_ESTATE"],
      minInvestment: 50,
      countriesAvailable: ["US", "CA", "EU"],
      affiliateUrl:
        "https://realt.co?utm_source=zitrum&utm_medium=referral&utm_campaign=platform",
      isActive: true,
    },
  });

  // Fetch all tokens via curl — api.realtoken.community is behind Cloudflare,
  // which blocks Node.js fetch (undici) on Vercel but passes curl's TLS fingerprint.
  let tokens: RealTokenApiEntry[];
  try {
    const raw = execSync(
      `curl -s --max-time 30 -H 'User-Agent: ZITRUM/1.0 (marketplace aggregator)' '${REALT_API_URL}'`,
      { encoding: "utf8", timeout: 35_000 }
    );
    tokens = JSON.parse(raw) as RealTokenApiEntry[];
  } catch (err) {
    const error = `Failed to fetch RealT API: ${String(err)}`;
    console.error(`[RealT] ${error}`);
    return { platform: "RealT", total: 0, new: 0, updated: 0, error };
  }

  // Filter: only active real_estate_rental tokens (skip OLD- prefix and other types)
  const activeTokens = tokens.filter(
    (t) =>
      t.productType === "real_estate_rental" && !t.fullName.startsWith("OLD-")
  );

  console.log(
    `[RealT] Fetched ${tokens.length} total tokens, ${activeTokens.length} active rental properties`
  );

  // Pre-fetch existing opportunity URLs for this platform to track new vs updated
  const existing = await prisma.opportunity.findMany({
    where: { platformId: platform.id },
    select: { externalUrl: true },
  });
  const existingUrls = new Set(existing.map((o) => o.externalUrl));

  const now = new Date();
  const mapped = activeTokens.map((token) => {
    const { city, country } = parseLocation(token.fullName);
    const slug = buildSlug(token.fullName);
    const externalUrl = `${REALT_BASE_URL}/product/${slug}/?utm_source=zitrum&utm_medium=referral&utm_campaign=opportunity`;

    const description =
      `Tokenized rental property at ${token.fullName}. ` +
      `Each token represents fractional ownership and entitles holders to daily rental income in stablecoins. ` +
      `Minimum investment: $${token.tokenPrice.toFixed(2)} per token. ` +
      `Powered by blockchain technology on the Gnosis/Ethereum network.`;

    return {
      platformId: platform.id,
      title: token.fullName,
      description,
      assetType: AssetType.REAL_ESTATE,
      minInvestment: token.tokenPrice,
      expectedReturnMin: null as number | null,
      expectedReturnMax: null as number | null,
      currency: token.currency || "USD",
      locationCountry: country,
      locationCity: city,
      riskLevel: getRiskLevel(),
      status: OpportunityStatus.ACTIVE,
      externalUrl,
      imageUrl: null as string | null,
      scrapedAt: now,
    };
  });

  // Split into new vs existing for accurate counts
  const newOps = mapped.filter((op) => !existingUrls.has(op.externalUrl));
  const updatedOps = mapped.filter((op) => existingUrls.has(op.externalUrl));

  // Batch-create new opportunities
  if (newOps.length > 0) {
    await prisma.opportunity.createMany({ data: newOps });
    console.log(`[RealT] Created ${newOps.length} new opportunities`);
  }

  // Update existing ones (token price may change)
  if (updatedOps.length > 0) {
    for (const op of updatedOps) {
      await prisma.opportunity.update({
        where: { externalUrl: op.externalUrl },
        data: { minInvestment: op.minInvestment, scrapedAt: op.scrapedAt },
      });
    }
    console.log(`[RealT] Updated ${updatedOps.length} existing opportunities`);
  }

  return {
    platform: "RealT",
    total: mapped.length,
    new: newOps.length,
    updated: updatedOps.length,
  };
}
