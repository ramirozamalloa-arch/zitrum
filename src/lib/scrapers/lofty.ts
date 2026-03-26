import { createHmac, createHash } from "crypto";
import { execSync } from "child_process";
import { AssetType, RiskLevel, OpportunityStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Lofty scraper
//
// The API at api.lofty.ai is protected by:
//   1. AWS Cognito Identity Pool auth (unauthenticated/guest access is allowed)
//   2. Cloudflare bot protection (blocks Python's TLS fingerprint; Node.js passes)
//
// Auth flow on each run:
//   GetId (Cognito Identity Pool) → GetCredentialsForIdentity → SigV4-sign GET
//
// Cognito Identity Pool (from Lofty's public JS bundle):
//   us-east-1:2c317179-beec-488f-8bc2-f7be6fc13872
// ---------------------------------------------------------------------------

const LOFTY_IDENTITY_POOL_ID = "us-east-1:2c317179-beec-488f-8bc2-f7be6fc13872";
const LOFTY_API_URL = "https://api.lofty.ai/prod/properties/v2/get-list-view-data";
const LOFTY_BASE_URL = "https://www.lofty.ai";
const COGNITO_ENDPOINT = "https://cognito-identity.us-east-1.amazonaws.com/";
const AWS_REGION = "us-east-1";
const AWS_SERVICE = "execute-api";

// ---------------------------------------------------------------------------
// SigV4 helpers (Node built-in crypto — no AWS SDK needed)
// ---------------------------------------------------------------------------

function hmacSha256(key: Buffer | string, data: string): Buffer {
  return createHmac("sha256", key).update(data, "utf8").digest();
}

function sha256Hex(data: string): string {
  return createHash("sha256").update(data, "utf8").digest("hex");
}

function getSigningKey(secretKey: string, dateStamp: string, region: string, service: string): Buffer {
  const kDate = hmacSha256("AWS4" + secretKey, dateStamp);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, service);
  return hmacSha256(kService, "aws4_request");
}

interface AwsCreds {
  AccessKeyId: string;
  SecretKey: string;
  SessionToken: string;
}

function buildSigV4Headers(url: string, creds: AwsCreds): Record<string, string> {
  const { AccessKeyId, SecretKey, SessionToken } = creds;
  const parsed = new URL(url);
  const host = parsed.host;
  const path = parsed.pathname;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "").slice(0, 15) + "Z";
  const dateStamp = amzDate.slice(0, 8);

  const canonicalHeaders =
    `host:${host}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-security-token:${SessionToken}\n`;
  const signedHeaders = "host;x-amz-date;x-amz-security-token";
  const payloadHash = sha256Hex("");

  const canonicalRequest = [
    "GET",
    path,
    "", // no query string
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${AWS_REGION}/${AWS_SERVICE}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const signingKey = getSigningKey(SecretKey, dateStamp, AWS_REGION, AWS_SERVICE);
  const signature = createHmac("sha256", signingKey).update(stringToSign, "utf8").digest("hex");

  return {
    Host: host,
    "x-amz-date": amzDate,
    "x-amz-security-token": SessionToken,
    Authorization:
      `AWS4-HMAC-SHA256 Credential=${AccessKeyId}/${credentialScope}, ` +
      `SignedHeaders=${signedHeaders}, Signature=${signature}`,
    Accept: "application/json",
  };
}

// ---------------------------------------------------------------------------
// Cognito: get guest credentials for the Lofty identity pool
// ---------------------------------------------------------------------------

async function getLoftyCreds(): Promise<AwsCreds> {
  const cognitoHeaders = {
    "Content-Type": "application/x-amz-json-1.1",
  };

  // Step 1: get an identity ID for unauthenticated access
  const idRes = await fetch(COGNITO_ENDPOINT, {
    method: "POST",
    headers: {
      ...cognitoHeaders,
      "X-Amz-Target": "AWSCognitoIdentityService.GetId",
    },
    body: JSON.stringify({ IdentityPoolId: LOFTY_IDENTITY_POOL_ID }),
  });
  if (!idRes.ok) throw new Error(`Cognito GetId failed: ${idRes.status}`);
  const { IdentityId } = (await idRes.json()) as { IdentityId: string };

  // Step 2: exchange identity ID for temp AWS credentials
  const credRes = await fetch(COGNITO_ENDPOINT, {
    method: "POST",
    headers: {
      ...cognitoHeaders,
      "X-Amz-Target": "AWSCognitoIdentityService.GetCredentialsForIdentity",
    },
    body: JSON.stringify({ IdentityId }),
  });
  if (!credRes.ok) throw new Error(`Cognito GetCredentials failed: ${credRes.status}`);
  const { Credentials } = (await credRes.json()) as { Credentials: AwsCreds };
  return Credentials;
}

// ---------------------------------------------------------------------------
// Lofty API response type
// ---------------------------------------------------------------------------

interface LoftyProperty {
  address: string;
  image: string;
  lastPrice: number;
  bestAsk: number;
  coc: number;
  projectedCoc: number;
  projectedAnnualReturn: number;
  capRate: number;
  city: string;
  state: string;
  zipcode: string;
  propertyType: string;
  slug: string;
  propertyId: string;
  salePrice: number;
  numIssued: number;
  tokensAvailable: number;
  isOccupied: boolean;
  isDelinquent: boolean;
  featured: string;
}

// ---------------------------------------------------------------------------
// Field mappers
// ---------------------------------------------------------------------------

function getRiskLevel(coc: number): RiskLevel {
  if (coc > 12) return RiskLevel.HIGH;
  if (coc >= 8) return RiskLevel.MEDIUM;
  return RiskLevel.LOW;
}

function buildDescription(p: LoftyProperty): string {
  const type = p.propertyType
    ? p.propertyType.charAt(0).toUpperCase() + p.propertyType.slice(1)
    : "Residential";
  const occupancy = p.isOccupied ? "Currently tenant-occupied" : "Currently vacant";
  const totalValue = p.salePrice ? `$${p.salePrice.toLocaleString("en-US")}` : "N/A";
  const yield_ = p.coc ? `${p.coc.toFixed(1)}%` : "N/A";
  return (
    `${type} property at ${p.address}, ${p.city}, ${p.state}. ` +
    `${occupancy}. Total property value: ${totalValue}. ` +
    `Cash-on-cash yield: ${yield_}. Daily rental income distributed to token holders on the Algorand blockchain. ` +
    `Minimum investment: $${p.lastPrice ?? p.bestAsk} per token.`
  );
}

// ---------------------------------------------------------------------------
// Main scraper
// ---------------------------------------------------------------------------

export async function scrapeLofty(): Promise<{
  platform: string;
  total: number;
  new: number;
  updated: number;
  error?: string;
}> {
  console.log("[Lofty] Starting scrape...");

  // Upsert the Lofty platform record
  const platform = await prisma.platform.upsert({
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

  // Get temporary Cognito credentials
  let creds: AwsCreds;
  try {
    creds = await getLoftyCreds();
    console.log("[Lofty] Got Cognito credentials");
  } catch (err) {
    const error = `Failed to get Cognito credentials: ${String(err)}`;
    console.error(`[Lofty] ${error}`);
    return { platform: "Lofty", total: 0, new: 0, updated: 0, error };
  }

  // Fetch property list with SigV4-signed request.
  // Node.js fetch (undici) triggers Cloudflare bot protection (1010/403).
  // curl passes Cloudflare's TLS fingerprinting check, so we shell out to it.
  let properties: LoftyProperty[];
  try {
    const h = buildSigV4Headers(LOFTY_API_URL, creds);
    const curlCmd = [
      "curl", "-s", "--max-time", "30",
      "-H", `Host: ${h["Host"]}`,
      "-H", `x-amz-date: ${h["x-amz-date"]}`,
      "-H", `x-amz-security-token: ${h["x-amz-security-token"]}`,
      "-H", `Authorization: ${h["Authorization"]}`,
      "-H", "Accept: application/json",
      "-H", "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      LOFTY_API_URL,
    ]
      .map((arg) => (arg.includes(" ") || arg.includes(":") ? `'${arg.replace(/'/g, "'\\''")}'` : arg))
      .join(" ");

    const raw = execSync(curlCmd, { encoding: "utf8", timeout: 35_000 });
    const json = JSON.parse(raw) as { success: boolean; data: LoftyProperty[] };
    if (!json.success || !Array.isArray(json.data)) {
      throw new Error(`Unexpected response shape: ${raw.slice(0, 200)}`);
    }
    properties = json.data;
    console.log(`[Lofty] Fetched ${properties.length} properties`);
  } catch (err) {
    const error = `Failed to fetch Lofty API: ${String(err)}`;
    console.error(`[Lofty] ${error}`);
    return { platform: "Lofty", total: 0, new: 0, updated: 0, error };
  }

  // Filter: skip delinquent properties
  const active = properties.filter((p) => !p.isDelinquent);
  console.log(`[Lofty] ${active.length} active (non-delinquent) properties`);

  // Pre-fetch existing URLs for this platform
  const existing = await prisma.opportunity.findMany({
    where: { platformId: platform.id },
    select: { externalUrl: true },
  });
  const existingUrls = new Set(existing.map((o) => o.externalUrl));

  const now = new Date();
  const mapped = active.map((p) => {
    const externalUrl =
      `${LOFTY_BASE_URL}/property/${p.slug}` +
      `?utm_source=zitrum&utm_medium=referral&utm_campaign=opportunity`;

    const minInvestment = p.lastPrice ?? p.bestAsk ?? 50;
    const yieldPct = p.coc ?? p.projectedCoc ?? 0;
    const totalReturn = p.projectedAnnualReturn ?? yieldPct;

    return {
      platformId: platform.id,
      title: `${p.address}, ${p.city}, ${p.state} ${p.zipcode}`.trim(),
      description: buildDescription(p),
      assetType: AssetType.REAL_ESTATE,
      minInvestment,
      expectedReturnMin: yieldPct > 0 ? yieldPct : null as number | null,
      expectedReturnMax: yieldPct > 0 ? yieldPct + 1.5 : null as number | null,
      currency: "USD",
      locationCountry: "US",
      locationCity: `${p.city}, ${p.state}`,
      riskLevel: getRiskLevel(yieldPct),
      status: OpportunityStatus.ACTIVE,
      externalUrl,
      imageUrl: p.image ?? null,
      scrapedAt: now,
    };
  });

  const newOps = mapped.filter((op) => !existingUrls.has(op.externalUrl));
  const updatedOps = mapped.filter((op) => existingUrls.has(op.externalUrl));

  if (newOps.length > 0) {
    await prisma.opportunity.createMany({ data: newOps });
    console.log(`[Lofty] Created ${newOps.length} new opportunities`);
  }

  if (updatedOps.length > 0) {
    for (const op of updatedOps) {
      await prisma.opportunity.update({
        where: { externalUrl: op.externalUrl },
        data: {
          minInvestment: op.minInvestment,
          expectedReturnMin: op.expectedReturnMin,
          expectedReturnMax: op.expectedReturnMax,
          riskLevel: op.riskLevel,
          scrapedAt: op.scrapedAt,
        },
      });
    }
    console.log(`[Lofty] Updated ${updatedOps.length} existing opportunities`);
  }

  return {
    platform: "Lofty",
    total: mapped.length,
    new: newOps.length,
    updated: updatedOps.length,
  };
}
