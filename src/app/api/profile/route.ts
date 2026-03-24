import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Hardcoded test user ID — replace with real auth once wired
// ---------------------------------------------------------------------------

const TEST_USER_ID = "test-user-00000000-0000-0000-0000-000000000001";

async function getUserId(): Promise<string> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.auth.getUser();
    if (data.user?.id) return data.user.id;
  } catch {
    // Auth not configured — fall through to test ID
  }
  return TEST_USER_ID;
}

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const ProfileSchema = z.object({
  displayName:         z.string().max(100).optional(),
  ageRange:            z.string().max(10).optional(),
  country:             z.string().max(100).optional(),
  availableCapitalMin: z.number().min(0).optional(),
  availableCapitalMax: z.number().min(0).optional(),
  riskTolerance:       z.number().int().min(1).max(5).optional(),
  investmentHorizon:   z.enum(["SHORT", "MEDIUM", "LONG"]).optional(),
  interestedAssetTypes: z.array(z.string()).optional(),
  interestedSectors:   z.array(z.string()).optional(),
  interestedRegions:   z.array(z.string()).optional(),
  esgPreference:       z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// GET — return current user's profile
// ---------------------------------------------------------------------------

export async function GET() {
  try {
    const userId = await getUserId();
    const profile = await prisma.investorProfile.findUnique({ where: { userId } });
    if (!profile) {
      return NextResponse.json({ profile: null }, { status: 200 });
    }
    return NextResponse.json({ profile });
  } catch (error) {
    console.error("[GET /api/profile]", error);
    return NextResponse.json({ error: "Failed to fetch profile." }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — create profile
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const data = ProfileSchema.parse(body);

    const profile = await prisma.investorProfile.create({
      data: {
        userId,
        ...data,
        interestedAssetTypes: data.interestedAssetTypes ?? [],
        interestedSectors:    data.interestedSectors    ?? [],
        interestedRegions:    data.interestedRegions    ?? [],
      },
    });

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 422 });
    }
    console.error("[POST /api/profile]", error);
    return NextResponse.json({ error: "Failed to create profile." }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PUT — upsert (create or update) profile
// ---------------------------------------------------------------------------

export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserId();
    const body = await request.json();
    const data = ProfileSchema.parse(body);

    const profile = await prisma.investorProfile.upsert({
      where: { userId },
      update: {
        ...data,
        ...(data.interestedAssetTypes !== undefined && { interestedAssetTypes: data.interestedAssetTypes }),
        ...(data.interestedSectors    !== undefined && { interestedSectors:    data.interestedSectors    }),
        ...(data.interestedRegions    !== undefined && { interestedRegions:    data.interestedRegions    }),
      },
      create: {
        userId,
        ...data,
        interestedAssetTypes: data.interestedAssetTypes ?? [],
        interestedSectors:    data.interestedSectors    ?? [],
        interestedRegions:    data.interestedRegions    ?? [],
      },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 422 });
    }
    console.error("[PUT /api/profile]", error);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
