#!/usr/bin/env tsx
/**
 * Manual scraper runner — invoked via `npm run scrape`
 * Runs all platform scrapers and prints a summary.
 */

import { runAllScrapers } from "../src/lib/scrapers";

async function main() {
  console.log("Starting ZITRUM scraper run...\n");
  const results = await runAllScrapers();

  console.log("\n=== Scraper Summary ===");
  for (const r of results) {
    const status = r.error ? "FAILED" : "OK";
    console.log(`[${status}] ${r.platform}: ${r.total} total, ${r.new} new, ${r.updated} updated`);
    if (r.error) console.log(`       Error: ${r.error}`);
  }

  const hasErrors = results.some((r) => r.error);
  process.exit(hasErrors ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
