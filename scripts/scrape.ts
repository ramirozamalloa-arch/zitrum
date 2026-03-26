#!/usr/bin/env tsx
/**
 * Manual scraper runner — invoked via `npm run scrape`
 * Runs all platform scrapers and prints a summary.
 */

// Load .env.local synchronously BEFORE any scrapers are imported.
// Static imports are hoisted, so prisma.ts (which creates pg.Pool at init time)
// would run before dotenv if we used a top-level import for the scrapers.
// Dynamic import() below solves this — it runs after config() has executed.
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const dir = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(dir, "../.env.local"), quiet: true });

async function main() {
  // Dynamic import ensures prisma.ts initialises AFTER DATABASE_URL is set
  const { runAllScrapers } = await import("../src/lib/scrapers/index.js");

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
