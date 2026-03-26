import { AssetType, RiskLevel, OpportunityStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Lofty scraper
//
// Lofty's marketplace (lofty.ai/marketplace) is a fully JavaScript-rendered SPA.
// Their public API (api.lofty.ai) is a CRM integration API requiring OAuth/API key,
// not a public marketplace data feed.
//
// TO DISCOVER THE INTERNAL API ENDPOINTS:
//   1. Run: npx puppeteer browse https://www.lofty.ai/marketplace
//   2. Open DevTools → Network → XHR/Fetch tab
//   3. Record the API calls made when the page loads properties
//   4. Update LOFTY_API_ENDPOINTS below with the discovered URLs
//
// Known alternative: each property is an Algorand Standard Asset (ASA) on-chain.
// Query via Algorand public indexer: https://mainnet-idx.algonode.cloud/v2/assets
// (no auth required, but requires mapping ASA IDs to property data)
// ---------------------------------------------------------------------------

// Update these with discovered endpoints from Puppeteer network interception
const LOFTY_API_ENDPOINTS: string[] = [
  // Example: "https://api.lofty.ai/v1/properties?status=active&limit=100"
  // Populate after running the network interception discovery
];

export async function scrapeLofty(): Promise<{
  platform: string;
  total: number;
  new: number;
  updated: number;
  error?: string;
}> {
  console.log("[Lofty] Starting scrape...");

  // Upsert the Lofty platform record
  await prisma.platform.upsert({
    where: { slug: "lofty" },
    update: { isActive: true },
    create: {
      name: "Lofty",
      slug: "lofty",
      website: "https://lofty.ai",
      logoUrl: "https://placehold.co/120x40/1A1A1D/D4A853?text=Lofty",
      description:
        "Lofty enables fractional real estate investing with daily rental income payouts. Properties are tokenized on the Algorand blockchain.",
      assetTypes: ["REAL_ESTATE"],
      minInvestment: 50,
      countriesAvailable: ["US"],
      affiliateUrl:
        "https://lofty.ai?utm_source=zitrum&utm_medium=referral&utm_campaign=platform",
      isActive: true,
    },
  });

  if (LOFTY_API_ENDPOINTS.length === 0) {
    const msg =
      "No Lofty API endpoints configured. Run Puppeteer network interception to discover them.";
    console.warn(`[Lofty] ${msg}`);
    return { platform: "Lofty", total: 0, new: 0, updated: 0, error: msg };
  }

  // Try each discovered endpoint until one succeeds
  for (const endpoint of LOFTY_API_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        headers: {
          "User-Agent": "ZITRUM/1.0 (marketplace aggregator)",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        console.warn(`[Lofty] Endpoint ${endpoint} returned ${response.status}`);
        continue;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = (await response.json()) as any;
      console.log(`[Lofty] Got response from ${endpoint}:`, JSON.stringify(data).slice(0, 200));

      // TODO: Map response to Opportunity model once endpoint structure is known
      // const mapped = mapLoftyResponse(data, platformId);
      // ... upsert logic here

      return { platform: "Lofty", total: 0, new: 0, updated: 0 };
    } catch (err) {
      console.warn(`[Lofty] Failed to fetch ${endpoint}: ${String(err)}`);
    }
  }

  return {
    platform: "Lofty",
    total: 0,
    new: 0,
    updated: 0,
    error: "All configured Lofty endpoints failed",
  };
}

// ---------------------------------------------------------------------------
// Helper: map a Lofty property object to our Opportunity shape
// (Fill in once the endpoint structure is known)
// ---------------------------------------------------------------------------

function _getRiskLevel(yieldPct: number): RiskLevel {
  if (yieldPct > 12) return RiskLevel.HIGH;
  if (yieldPct >= 8) return RiskLevel.MEDIUM;
  return RiskLevel.LOW;
}

// Suppress "unused" warning — will be used once endpoint structure is known
void _getRiskLevel;
void AssetType;
void OpportunityStatus;
