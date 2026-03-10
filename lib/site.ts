export const BASE_URL = "https://halasaves.com";

export const AI_BOT_USER_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "PerplexityBot",
  "Applebot-Extended",
] as const;

export function getDealUrl(dealSlug: string): string {
  return `${BASE_URL}/deals/${dealSlug}`;
}
