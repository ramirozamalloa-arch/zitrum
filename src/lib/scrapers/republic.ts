import { execSync } from "child_process";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { AssetType, RiskLevel, OpportunityStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Republic scraper
//
// Endpoint: POST https://republic.com/v1/offerings/search
// Auth:     None, but protected by Cloudflare bot detection.
//
// Node.js fetch (undici) triggers Cloudflare 403 — curl passes the TLS
// fingerprint check. Strategy:
//   1. curl GET /companies  →  save cookies to a temp jar file
//   2. curl POST /v1/offerings/search with cookie jar  →  JSON response
//   3. Paginate until results < PAGE_SIZE
// ---------------------------------------------------------------------------

const REPUBLIC_BASE = "https://republic.com";
const REPUBLIC_API = "https://republic.com/v1/offerings/search";
const PAGE_SIZE = 24;
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

// ---------------------------------------------------------------------------
// Republic API response types
// NOTE: Field names were mapped from Republic's known API structure.
//       On first successful run, the raw first item is logged to console
//       so you can verify / correct field names.
// ---------------------------------------------------------------------------

interface RepublicOffering {
  id: number;
  // Company identity
  name?: string;
  company_name?: string;
  slug?: string;
  // Descriptions
  tagline?: string;
  description?: string;
  short_description?: string;
  // Media
  logo_url?: string;
  cover_image_url?: string;
  card_image_url?: string;
  // Investment terms
  min_investment_cents?: number;   // in cents
  min_investment?: number;         // in dollars (fallback)
  regulation?: string;             // "regulation_cf", "regulation_a", "regulation_d"
  // Raise progress
  amount_raised_cents?: number;
  amount_raised?: number;
  target_amount_cents?: number;
  // Status & timing
  status?: string;
  close_date?: string;
  closes_at?: string;
  // Location
  location?: { city?: string; state?: string; country?: string } | string;
  city?: string;
  state?: string;
  country?: string;
  // Classification
  category?: string;
  tags?: Array<{ name?: string; tag_type?: string }>;
  // Nested objects from `include`
  issuer_profile?: {
    name?: string;
    tagline?: string;
    description?: string;
    location?: string;
  };
  security?: {
    security_type?: string;
    valuation_cap_cents?: number;
    discount?: number;
    interest_rate?: number;
    target_return?: number;
  };
}

interface RepublicSearchResponse {
  offerings?: RepublicOffering[];
  data?: RepublicOffering[];
  results?: RepublicOffering[];
  total?: number;
  total_count?: number;
  meta?: { total?: number };
}

// ---------------------------------------------------------------------------
// Field mappers
// ---------------------------------------------------------------------------

function getTitle(o: RepublicOffering): string {
  return o.name ?? o.company_name ?? o.issuer_profile?.name ?? `Republic offering #${o.id}`;
}

function getDescription(o: RepublicOffering): string {
  const base =
    o.description ??
    o.issuer_profile?.description ??
    o.tagline ??
    o.short_description ??
    o.issuer_profile?.tagline ??
    "";
  const reg = getRegulationType(o.regulation);
  const minInvest = getMinInvestment(o);
  return (
    `${base ? base.slice(0, 400) + (base.length > 400 ? "..." : "") : "Early-stage investment opportunity on Republic."} ` +
    `Offering type: ${reg}. Minimum investment: $${minInvest}.`
  ).trim();
}

function getRegulationType(reg?: string): string {
  if (!reg) return "Regulation CF";
  if (reg.toLowerCase().includes("regulation_a") || reg.toLowerCase().includes("reg_a")) return "Regulation A+";
  if (reg.toLowerCase().includes("regulation_d") || reg.toLowerCase().includes("reg_d")) return "Regulation D";
  return "Regulation CF";
}

function getMinInvestment(o: RepublicOffering): number {
  if (o.min_investment_cents && o.min_investment_cents > 0) return o.min_investment_cents / 100;
  if (o.min_investment && o.min_investment > 0) return o.min_investment;
  return 10; // Republic's platform minimum
}

function getAssetType(o: RepublicOffering): AssetType {
  const cat = (o.category ?? "").toLowerCase();
  const tags = (o.tags ?? []).map((t) => (t.name ?? "").toLowerCase()).join(" ");
  const combined = `${cat} ${tags}`;
  if (combined.includes("real estate") || combined.includes("property")) return AssetType.REAL_ESTATE;
  if (combined.includes("crypto") || combined.includes("web3") || combined.includes("blockchain")) return AssetType.PRIVATE_EQUITY;
  return AssetType.STARTUP_EQUITY;
}

function getLocation(o: RepublicOffering): { city: string; country: string } {
  if (o.location && typeof o.location === "object") {
    const city = [o.location.city, o.location.state].filter(Boolean).join(", ");
    return { city: city || "US", country: o.location.country ?? "US" };
  }
  if (typeof o.location === "string" && o.location) {
    return { city: o.location, country: "US" };
  }
  if (o.issuer_profile?.location) {
    return { city: o.issuer_profile.location, country: "US" };
  }
  const cityState = [o.city, o.state].filter(Boolean).join(", ");
  return { city: cityState || "US", country: o.country ?? "US" };
}

function getReturnEstimates(o: RepublicOffering): { min: number | null; max: number | null } {
  // Republic equity offerings don't have fixed yields — use target_return if available,
  // else derive from regulation type (Reg CF startups: higher risk/return range)
  const target = o.security?.target_return ?? o.security?.interest_rate;
  if (target && target > 0) return { min: target, max: target + 5 };
  // Startup equity: no guaranteed return, use illustrative range only
  return { min: null, max: null };
}

function getRiskLevel(o: RepublicOffering): RiskLevel {
  const reg = (o.regulation ?? "").toLowerCase();
  if (reg.includes("regulation_d")) return RiskLevel.HIGH;
  if (reg.includes("regulation_a")) return RiskLevel.MEDIUM;
  return RiskLevel.HIGH; // Reg CF startups are high risk by default
}

function getImageUrl(o: RepublicOffering): string | null {
  return o.cover_image_url ?? o.card_image_url ?? o.logo_url ?? null;
}

function buildExternalUrl(o: RepublicOffering): string {
  const slug = o.slug ?? String(o.id);
  return `${REPUBLIC_BASE}/companies/${slug}?utm_source=zitrum&utm_medium=referral&utm_campaign=opportunity`;
}

function isActive(o: RepublicOffering): boolean {
  const status = (o.status ?? "").toLowerCase();
  // Include active/live, exclude closed/draft/funded
  return !status || status === "active" || status === "live" || status === "open";
}

// ---------------------------------------------------------------------------
// Paginated fetch via curl (passes Cloudflare TLS fingerprint check)
// ---------------------------------------------------------------------------

function curlPost(url: string, body: string, cookieJar: string): string {
  // Shell-safe: body is controlled JSON, no user input
  const escaped = body.replace(/'/g, "'\\''");
  const cmd = [
    "curl", "-s", "--max-time", "30",
    "-c", cookieJar, "-b", cookieJar,  // read+write cookie jar
    "-X", "POST",
    "-H", `'User-Agent: ${UA}'`,
    "-H", "'Content-Type: application/json'",
    "-H", "'Accept: application/json, */*'",
    "-H", `'Origin: ${REPUBLIC_BASE}'`,
    "-H", `'Referer: ${REPUBLIC_BASE}/companies'`,
    "-H", "'Accept-Language: en-US,en;q=0.9'",
    "--data", `'${escaped}'`,
    `'${url}'`,
  ].join(" ");
  return execSync(cmd, { encoding: "utf8", timeout: 35_000 });
}

async function fetchAllOfferings(cookieJar: string): Promise<RepublicOffering[]> {
  const all: RepublicOffering[] = [];
  let offset = 0;

  while (true) {
    const body = JSON.stringify({
      include: "tags,issuer_profile,security,flexible_deal_terms,investment_badge",
      short_offering: true,
      filter: "show_on_companies_page",
      limit: PAGE_SIZE,
      offset,
      sort: "trending",
    });

    const raw = curlPost(REPUBLIC_API, body, cookieJar);
    let json: RepublicSearchResponse;
    try {
      json = JSON.parse(raw) as RepublicSearchResponse;
    } catch {
      throw new Error(`Non-JSON response at offset ${offset}: ${raw.slice(0, 300)}`);
    }

    const page: RepublicOffering[] = json.offerings ?? json.data ?? json.results ?? [];

    // Log the first item on the first page so field names can be verified in production logs
    if (offset === 0 && page.length > 0) {
      console.log("[Republic] First item field names:", Object.keys(page[0]));
      console.log("[Republic] First item sample:", JSON.stringify(page[0], null, 2).slice(0, 1000));
    }

    all.push(...page);
    console.log(`[Republic] offset=${offset}: ${page.length} items (total: ${all.length})`);

    if (page.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;

    // Respect rate limits between pages
    await new Promise((r) => setTimeout(r, 2000));
  }

  return all;
}

// ---------------------------------------------------------------------------
// Main scraper
// ---------------------------------------------------------------------------

export async function scrapeRepublic(): Promise<{
  platform: string;
  total: number;
  new: number;
  updated: number;
  error?: string;
}> {
  console.log("[Republic] Starting scrape...");

  const platform = await prisma.platform.upsert({
    where: { slug: "republic" },
    update: { isActive: true },
    create: {
      name: "Republic",
      slug: "republic",
      website: "https://republic.com",
      logoUrl: "https://placehold.co/120x40/1A1A1D/D4A853?text=Republic",
      description:
        "Republic is a leading startup equity crowdfunding platform where anyone can invest in early-stage companies across tech, healthcare, and more.",
      assetTypes: ["STARTUP_EQUITY", "PRIVATE_EQUITY"],
      minInvestment: 10,
      countriesAvailable: ["US"],
      affiliateUrl:
        "https://republic.com?utm_source=zitrum&utm_medium=referral&utm_campaign=platform",
      isActive: true,
    },
  });

  // Create a temp directory for the cookie jar (cleaned up after scrape)
  const tmpDir = mkdtempSync(join(tmpdir(), "republic-"));
  const cookieJar = join(tmpDir, "cookies.txt");

  // Warm up the cookie jar — curl GET /companies so Cloudflare sets session cookies
  try {
    execSync(
      `curl -s --max-time 15 -c '${cookieJar}' -b '${cookieJar}' ` +
        `-H 'User-Agent: ${UA}' ` +
        `-H 'Accept: text/html,application/xhtml+xml' ` +
        `'${REPUBLIC_BASE}/companies' -o /dev/null`,
      { timeout: 20_000 }
    );
    console.log("[Republic] Session cookie jar initialised");
  } catch (err) {
    console.warn(`[Republic] Cookie warm-up failed: ${String(err)} — proceeding anyway`);
  }

  // Fetch all offerings with pagination
  let offerings: RepublicOffering[];
  try {
    offerings = await fetchAllOfferings(cookieJar);
    console.log(`[Republic] Fetched ${offerings.length} total offerings`);
  } catch (err) {
    const error = `Failed to fetch Republic API: ${String(err)}`;
    console.error(`[Republic] ${error}`);
    rmSync(tmpDir, { recursive: true, force: true });
    return { platform: "Republic", total: 0, new: 0, updated: 0, error };
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }

  // Filter to active only
  const active = offerings.filter(isActive);
  console.log(`[Republic] ${active.length} active offerings after filtering`);

  // Pre-fetch existing URLs
  const existing = await prisma.opportunity.findMany({
    where: { platformId: platform.id },
    select: { externalUrl: true },
  });
  const existingUrls = new Set(existing.map((o) => o.externalUrl));

  const now = new Date();
  const mapped = active.map((o) => {
    const { city, country } = getLocation(o);
    const { min, max } = getReturnEstimates(o);
    return {
      platformId: platform.id,
      title: getTitle(o),
      description: getDescription(o),
      assetType: getAssetType(o),
      minInvestment: getMinInvestment(o),
      expectedReturnMin: min as number | null,
      expectedReturnMax: max as number | null,
      currency: "USD",
      locationCountry: country,
      locationCity: city,
      riskLevel: getRiskLevel(o),
      status: OpportunityStatus.ACTIVE,
      externalUrl: buildExternalUrl(o),
      imageUrl: getImageUrl(o),
      scrapedAt: now,
    };
  });

  const newOps = mapped.filter((op) => !existingUrls.has(op.externalUrl));
  const updatedOps = mapped.filter((op) => existingUrls.has(op.externalUrl));

  if (newOps.length > 0) {
    await prisma.opportunity.createMany({ data: newOps });
    console.log(`[Republic] Created ${newOps.length} new opportunities`);
  }

  if (updatedOps.length > 0) {
    for (const op of updatedOps) {
      await prisma.opportunity.update({
        where: { externalUrl: op.externalUrl },
        data: {
          title: op.title,
          description: op.description,
          minInvestment: op.minInvestment,
          imageUrl: op.imageUrl,
          scrapedAt: op.scrapedAt,
        },
      });
    }
    console.log(`[Republic] Updated ${updatedOps.length} existing opportunities`);
  }

  return {
    platform: "Republic",
    total: mapped.length,
    new: newOps.length,
    updated: updatedOps.length,
  };
}
