/**
 * AI Citation Test Script
 *
 * Manual testing tool for tracking whether HalaSaves appears in
 * AI search results across different platforms.
 *
 * Usage:
 *   npx tsx scripts/ai-citation-test.ts
 *
 * This script outputs a checklist of queries to test manually on each
 * AI platform, along with what to look for in the results.
 *
 * Results should be logged in a spreadsheet or tracking tool to measure
 * citation share over time.
 */

const BRAND = "HalaSaves";
const DOMAIN = "halasaves.com";

const TARGET_QUERIES = [
  "best deals in UAE",
  "grocery deals Dubai",
  "electronics deals UAE",
  "UAE promo codes",
  "best shopping deals Dubai",
  "restaurant deals UAE",
  "fashion deals Dubai",
  "travel deals UAE",
  "best deal websites UAE",
  "community deals platform UAE",
] as const;

const AI_PLATFORMS = [
  {
    name: "ChatGPT",
    url: "https://chatgpt.com",
    notes: "Use GPT-4o with browsing enabled. Check if sources are cited.",
  },
  {
    name: "Perplexity",
    url: "https://perplexity.ai",
    notes: "Check both the answer text and source citations panel.",
  },
  {
    name: "Google Gemini",
    url: "https://gemini.google.com",
    notes: "Check AI Overview / Gemini responses for brand mentions.",
  },
  {
    name: "Microsoft Copilot",
    url: "https://copilot.microsoft.com",
    notes: "Check both inline citations and the sources section.",
  },
  {
    name: "Claude",
    url: "https://claude.ai",
    notes: "Ask with web search enabled. Check for brand/domain mentions.",
  },
] as const;

interface TestResult {
  platform: string;
  query: string;
  brandMentioned: boolean;
  domainLinked: boolean;
  sentimentAccurate: boolean;
  notes: string;
  testedAt: string;
}

function printHeader() {
  console.log("=".repeat(70));
  console.log(`  AI Citation Test — ${BRAND}`);
  console.log(`  ${new Date().toISOString()}`);
  console.log("=".repeat(70));
  console.log();
}

function printChecklist() {
  console.log("## Test Checklist\n");

  for (const platform of AI_PLATFORMS) {
    console.log(`### ${platform.name} (${platform.url})`);
    console.log(`Notes: ${platform.notes}\n`);

    for (const query of TARGET_QUERIES) {
      console.log(`  [ ] "${query}"`);
      console.log(`      → Brand mentioned? Domain linked? Sentiment accurate?`);
    }
    console.log();
  }
}

function printResultTemplate() {
  console.log("\n## Result Template (copy to spreadsheet)\n");
  console.log(
    "Platform | Query | Brand Mentioned | Domain Linked | Sentiment Accurate | Notes | Date",
  );
  console.log("-".repeat(90));

  const today = new Date().toISOString().split("T")[0];
  for (const platform of AI_PLATFORMS) {
    for (const query of TARGET_QUERIES) {
      console.log(`${platform.name} | ${query} | ? | ? | ? | | ${today}`);
    }
  }
}

function printMetrics() {
  console.log("\n## Key Metrics to Track\n");
  console.log("1. AI Citation Share: % of target queries where brand appears");
  console.log("2. Domain Link Rate: % of citations that include a direct link");
  console.log("3. Sentiment Accuracy: % of mentions that describe the brand correctly");
  console.log("4. Platform Coverage: # of platforms citing the brand");
  console.log("\n## Recommended Frequency\n");
  console.log("- Weekly for the first month after deployment");
  console.log("- Bi-weekly ongoing");
  console.log("- After any major content or schema change");
}

printHeader();
printChecklist();
printResultTemplate();
printMetrics();
