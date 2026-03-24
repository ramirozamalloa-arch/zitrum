import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { z } from "zod";

const TEST_USER_ID = "test-user-00000000-0000-0000-0000-000000000001";

async function getUserId(): Promise<string> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.auth.getUser();
    if (data.user?.id) return data.user.id;
  } catch {
    // fall through
  }
  return TEST_USER_ID;
}

const ToggleSchema = z.object({
  opportunityId: z.string().uuid(),
});

// ---------------------------------------------------------------------------
// GET — return all saved opportunity IDs for the current user
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const userId = await getUserId();
    const saved = await prisma.savedOpportunity.findMany({
      where: { userId },
      select: { opportunityId: true },
    });
    return NextResponse.json({ savedIds: saved.map((s: { opportunityId: string }) => s.opportunityId) });
  } catch (error) {
    console.error("[GET /api/bookmarks]", error);
    return NextResponse.json({ error: "Failed to fetch bookmarks." }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — toggle bookmark (save if not saved, unsave if already saved)
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const { opportunityId } = ToggleSchema.parse(body);

    // SavedOpportunity requires InvestorProfile to exist (FK constraint).
    // Auto-create a minimal profile so bookmarking works before onboarding.
    await prisma.investorProfile.upsert({
      where: { userId },
      create: {
        userId,
        interestedAssetTypes: [],
        interestedSectors: [],
        interestedRegions: [],
      },
      update: {},
    });

    const existing = await prisma.savedOpportunity.findUnique({
      where: { userId_opportunityId: { userId, opportunityId } },
    });

    if (existing) {
      await prisma.savedOpportunity.delete({
        where: { userId_opportunityId: { userId, opportunityId } },
      });
      return NextResponse.json({ saved: false, opportunityId });
    } else {
      await prisma.savedOpportunity.create({
        data: { userId, opportunityId },
      });
      return NextResponse.json({ saved: true, opportunityId });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 422 });
    }
    console.error("[POST /api/bookmarks]", error);
    return NextResponse.json({ error: "Failed to toggle bookmark." }, { status: 500 });
  }
}
