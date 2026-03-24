import { AssetType, RiskLevel, OpportunityStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Platform data
// ---------------------------------------------------------------------------

const platforms = [
  {
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

// ---------------------------------------------------------------------------
// Opportunity builder helpers
// ---------------------------------------------------------------------------

function img(label: string) {
  const encoded = encodeURIComponent(label);
  return `https://placehold.co/800x400/1A1A1D/D4A853?text=${encoded}`;
}

function realtUrl(slug: string) {
  return `https://realt.co/product/${slug}/?utm_source=zitrum&utm_medium=referral&utm_campaign=opportunity`;
}

function republicUrl(slug: string) {
  return `https://republic.com/companies/${slug}?utm_source=zitrum&utm_medium=referral&utm_campaign=opportunity`;
}

function loftyUrl(slug: string) {
  return `https://lofty.ai/p/${slug}?utm_source=zitrum&utm_medium=referral&utm_campaign=opportunity`;
}

// ---------------------------------------------------------------------------
// Seed function
// ---------------------------------------------------------------------------

export async function seed() {
  // Clear existing data in dependency order
  await prisma.savedOpportunity.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.platform.deleteMany();

  // Insert platforms
  const [realt, republic, lofty] = await Promise.all(
    platforms.map((p) => prisma.platform.create({ data: p }))
  );

  // ---------------------------------------------------------------------------
  // RealT opportunities — US rental properties
  // ---------------------------------------------------------------------------

  const realtOpportunities = [
    {
      platformId: realt.id,
      title: "15777 Parkside St, Detroit MI",
      description:
        "A fully renovated 3-bedroom single-family rental in Detroit's growing Grandmont neighborhood. The property is tenant-occupied with a 12-month lease and generates consistent monthly rental income distributed daily to token holders.",
      assetType: AssetType.REAL_ESTATE,
      minInvestment: 50,
      expectedReturnMin: 9.2,
      expectedReturnMax: 11.4,
      currency: "USD",
      locationCountry: "US",
      locationCity: "Detroit, MI",
      riskLevel: RiskLevel.LOW,
      status: OpportunityStatus.ACTIVE,
      externalUrl: realtUrl("15777-parkside-st-detroit-mi-48223"),
      imageUrl: img("Detroit+Rental+Property"),
    },
    {
      platformId: realt.id,
      title: "9065 S Merrill Ave, Chicago IL",
      description:
        "A duplex on Chicago's South Side generating strong rental yields. Both units are occupied with long-term tenants. Investors receive pro-rata daily payouts in USDC proportional to their token holdings.",
      assetType: AssetType.REAL_ESTATE,
      minInvestment: 100,
      expectedReturnMin: 8.5,
      expectedReturnMax: 10.8,
      currency: "USD",
      locationCountry: "US",
      locationCity: "Chicago, IL",
      riskLevel: RiskLevel.LOW,
      status: OpportunityStatus.ACTIVE,
      externalUrl: realtUrl("9065-s-merrill-ave-chicago-il-60617"),
      imageUrl: img("Chicago+Duplex"),
    },
    {
      platformId: realt.id,
      title: "11957 Beaconsfield St, Cleveland OH",
      description:
        "Affordable single-family rental in Cleveland's Collinwood neighborhood. Strong cap rate backed by a Section 8 tenant, providing federally guaranteed rental income with attractive tokenized yield for investors.",
      assetType: AssetType.REAL_ESTATE,
      minInvestment: 50,
      expectedReturnMin: 10.1,
      expectedReturnMax: 12.3,
      currency: "USD",
      locationCountry: "US",
      locationCity: "Cleveland, OH",
      riskLevel: RiskLevel.MEDIUM,
      status: OpportunityStatus.ACTIVE,
      externalUrl: realtUrl("11957-beaconsfield-st-cleveland-oh-44110"),
      imageUrl: img("Cleveland+Rental"),
    },
  ];

  // ---------------------------------------------------------------------------
  // Republic opportunities — Startups
  // ---------------------------------------------------------------------------

  const republicOpportunities = [
    {
      platformId: republic.id,
      title: "ClearFi — Embedded Finance for Emerging Markets",
      description:
        "ClearFi builds embedded banking infrastructure for fintechs in Latin America and Southeast Asia. The company has processed over $80M in transactions, is growing 40% MoM, and is raising a Reg CF round to expand into three new markets.",
      assetType: AssetType.STARTUP_EQUITY,
      minInvestment: 100,
      expectedReturnMin: 18.0,
      expectedReturnMax: 30.0,
      currency: "USD",
      locationCountry: "US",
      locationCity: "New York, NY",
      riskLevel: RiskLevel.HIGH,
      status: OpportunityStatus.ACTIVE,
      externalUrl: republicUrl("clearfi"),
      imageUrl: img("ClearFi+Fintech"),
    },
    {
      platformId: republic.id,
      title: "Axiom AI — Enterprise Knowledge Automation",
      description:
        "Axiom AI develops large language model-powered tools that automate document workflows for Fortune 500 legal and compliance teams. With 14 enterprise pilots live and $2.1M ARR, the company is raising to accelerate its go-to-market.",
      assetType: AssetType.STARTUP_EQUITY,
      minInvestment: 250,
      expectedReturnMin: 20.0,
      expectedReturnMax: 28.0,
      currency: "USD",
      locationCountry: "US",
      locationCity: "San Francisco, CA",
      riskLevel: RiskLevel.HIGH,
      status: OpportunityStatus.ACTIVE,
      externalUrl: republicUrl("axiom-ai"),
      imageUrl: img("Axiom+AI"),
    },
    {
      platformId: republic.id,
      title: "SolarBridge — Community Solar for Underserved Markets",
      description:
        "SolarBridge develops and operates community solar installations in low-income communities, providing clean energy savings to subscribers and recurring revenue to investors. The company has 6 MW of projects in operation across 4 states.",
      assetType: AssetType.STARTUP_EQUITY,
      minInvestment: 500,
      expectedReturnMin: 15.0,
      expectedReturnMax: 22.0,
      currency: "USD",
      locationCountry: "US",
      locationCity: "Austin, TX",
      riskLevel: RiskLevel.MEDIUM,
      status: OpportunityStatus.ACTIVE,
      externalUrl: republicUrl("solarbridge"),
      imageUrl: img("SolarBridge+CleanEnergy"),
    },
  ];

  // ---------------------------------------------------------------------------
  // Lofty opportunities — Tokenized US properties
  // ---------------------------------------------------------------------------

  const loftyOpportunities = [
    {
      platformId: lofty.id,
      title: "832 Holbrook Dr NE, Atlanta GA",
      description:
        "A well-maintained 3-bedroom rental home in Atlanta's sought-after Lake Claire neighborhood. The property benefits from Atlanta's strong rental market fundamentals, low vacancy rates, and appreciation trends. Daily rental income distributed to token holders.",
      assetType: AssetType.REAL_ESTATE,
      minInvestment: 50,
      expectedReturnMin: 7.8,
      expectedReturnMax: 9.5,
      currency: "USD",
      locationCountry: "US",
      locationCity: "Atlanta, GA",
      riskLevel: RiskLevel.LOW,
      status: OpportunityStatus.ACTIVE,
      externalUrl: loftyUrl("832-holbrook-dr-ne-atlanta-ga"),
      imageUrl: img("Atlanta+Rental+Home"),
    },
    {
      platformId: lofty.id,
      title: "2219 Wentworth St, Houston TX",
      description:
        "Single-family rental in Houston's East End, a neighborhood undergoing significant revitalization driven by tech and healthcare job growth. Tenant-occupied with a 12-month lease and strong rent-to-value ratio.",
      assetType: AssetType.REAL_ESTATE,
      minInvestment: 50,
      expectedReturnMin: 8.2,
      expectedReturnMax: 10.1,
      currency: "USD",
      locationCountry: "US",
      locationCity: "Houston, TX",
      riskLevel: RiskLevel.LOW,
      status: OpportunityStatus.ACTIVE,
      externalUrl: loftyUrl("2219-wentworth-st-houston-tx"),
      imageUrl: img("Houston+Rental"),
    },
    {
      platformId: lofty.id,
      title: "4401 N 16th Ave, Phoenix AZ",
      description:
        "A 4-bedroom property in Phoenix's North Mountain Village with strong rental demand driven by the area's population growth and tech sector expansion. The property has been fully remodeled and offers investors stable cash flow with upside appreciation potential.",
      assetType: AssetType.REAL_ESTATE,
      minInvestment: 100,
      expectedReturnMin: 9.0,
      expectedReturnMax: 11.0,
      currency: "USD",
      locationCountry: "US",
      locationCity: "Phoenix, AZ",
      riskLevel: RiskLevel.MEDIUM,
      status: OpportunityStatus.ACTIVE,
      externalUrl: loftyUrl("4401-n-16th-ave-phoenix-az"),
      imageUrl: img("Phoenix+Property"),
    },
  ];

  // Insert all opportunities
  const allOpportunities = [
    ...realtOpportunities,
    ...republicOpportunities,
    ...loftyOpportunities,
  ];

  await prisma.opportunity.createMany({ data: allOpportunities });

  const counts = {
    platforms: 3,
    opportunities: allOpportunities.length,
    breakdown: {
      realt: realtOpportunities.length,
      republic: republicOpportunities.length,
      lofty: loftyOpportunities.length,
    },
  };

  return counts;
}
