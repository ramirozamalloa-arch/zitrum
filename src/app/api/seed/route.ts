import { NextResponse } from "next/server";
import { seed } from "@/lib/seed";

export async function GET() {
  try {
    const result = await seed();
    return NextResponse.json({
      success: true,
      message: "Database seeded successfully.",
      ...result,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
