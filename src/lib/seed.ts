import { prisma } from "@/lib/prisma";
import { scrapeRealT } from "@/lib/scrapers/realt";

// Platform stubs for platforms not yet fully scraped
const PLATFORM_STUBS = [
  {
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
  {
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
];

export async function seed() {
  console.log("[Seed] Clearing existing data...");

  // Clear in dependency order
  await prisma.savedOpportunity.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.platform.deleteMany();

  // Upsert platform stubs for Republic and Lofty (no live scraper yet)
  for (const stub of PLATFORM_STUBS) {
    await prisma.platform.upsert({
      where: { slug: stub.slug },
      update: {},
      create: stub,
    });
  }
  console.log(`[Seed] Upserted ${PLATFORM_STUBS.length} platform stubs`);

  // Run RealT scraper to populate live data
  console.log("[Seed] Running RealT scraper for live data...");
  const realtResult = await scrapeRealT();
  console.log("[Seed] RealT result:", realtResult);

  const platformCount = await prisma.platform.count();
  const opportunityCount = await prisma.opportunity.count();

  return {
    platforms: platformCount,
    opportunities: opportunityCount,
    breakdown: {
      realt: realtResult.total,
      realtNew: realtResult.new,
      republic: 0,
      lofty: 0,
    },
  };
}
