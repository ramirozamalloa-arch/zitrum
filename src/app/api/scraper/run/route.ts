import { NextRequest, NextResponse } from "next/server";
import { runAllScrapers } from "@/lib/scrapers";

// Only POST is supported — prevents accidental scrape triggers from browser navigation
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  const expectedKey = process.env.SCRAPER_API_KEY;

  if (!expectedKey) {
    return NextResponse.json(
      { error: "SCRAPER_API_KEY environment variable is not set" },
      { status: 500 }
    );
  }

  if (apiKey !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[/api/scraper/run] Scrape triggered via API");

  try {
    const results = await runAllScrapers();
    const totalNew = results.reduce((s, r) => s + r.new, 0);
    const totalUpdated = results.reduce((s, r) => s + r.updated, 0);
    const errors = results.filter((r) => r.error).map((r) => ({ platform: r.platform, error: r.error }));

    return NextResponse.json({
      success: true,
      summary: { totalNew, totalUpdated, platforms: results.length },
      results,
      ...(errors.length > 0 && { errors }),
    });
  } catch (err) {
    console.error("[/api/scraper/run] Fatal error:", err);
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
