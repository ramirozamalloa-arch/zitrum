import { scrapeRealT } from "./realt";
import { scrapeLofty } from "./lofty";
import { scrapeRepublic } from "./republic";

export interface ScraperResult {
  platform: string;
  total: number;
  new: number;
  updated: number;
  error?: string;
}

// Ordered list of scrapers — runs sequentially to respect rate limits
const SCRAPERS = [scrapeRealT, scrapeLofty, scrapeRepublic];

/**
 * Run all scrapers sequentially.
 * A single scraper failure does not stop the others.
 */
export async function runAllScrapers(): Promise<ScraperResult[]> {
  const results: ScraperResult[] = [];

  for (const scraper of SCRAPERS) {
    try {
      const result = await scraper();
      results.push(result);
    } catch (err) {
      const name = scraper.name.replace("scrape", "") || "Unknown";
      console.error(`[Scraper] ${name} threw an unhandled error:`, err);
      results.push({
        platform: name,
        total: 0,
        new: 0,
        updated: 0,
        error: String(err),
      });
    }
  }

  const totalNew = results.reduce((s, r) => s + r.new, 0);
  const totalUpdated = results.reduce((s, r) => s + r.updated, 0);
  console.log(
    `[Scraper] Done. ${totalNew} new, ${totalUpdated} updated across ${results.length} platforms.`
  );

  return results;
}
