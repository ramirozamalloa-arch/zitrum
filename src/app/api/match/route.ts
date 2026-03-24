import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateMatchScore } from "@/lib/matching/engine";

// Hardcoded test user — same as profile route
const TEST_USER_ID = "test-user-00000000-0000-0000-0000-000000000001";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") ?? TEST_USER_ID;

  try {
    const [profile, opportunities] = await Promise.all([
      prisma.investorProfile.findUnique({ where: { userId } }),
      prisma.opportunity.findMany({
        where: { status: "ACTIVE" },
        include: { platform: true },
      }),
    ]);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found for this user." }, { status: 404 });
    }

    const scored = opportunities
      .map((opp) => ({
        opportunity: opp,
        match: calculateMatchScore(profile, opp),
      }))
      .sort((a, b) => b.match.score - a.match.score);

    return NextResponse.json({ userId, scored });
  } catch (error) {
    console.error("[GET /api/match]", error);
    return NextResponse.json({ error: "Failed to calculate matches." }, { status: 500 });
  }
}
