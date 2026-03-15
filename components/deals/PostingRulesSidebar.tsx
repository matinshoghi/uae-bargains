const DO_RULES = [
  "Use a clear title with the price and store or website name.",
  "Link directly to the deal page, not the store homepage.",
  "Search first — avoid sharing duplicate deals.",
  "Disclose if you are the merchant or have a commercial relationship with the store.",
  "Write a helpful description including expiry date and any key terms.",
  "Only share deals available in the UAE.",
];

const DONT_RULES = [
  "Share duplicate deals.",
  "Use affiliate, referral, or tracking links.",
  "Share adult, gambling, or prohibited content.",
  "Share job listings, auctions, or private sales.",
  "Solicit votes or use multiple accounts.",
  "Use misleading titles or false price comparisons.",
];

export function PostingRulesSidebar() {
  return (
    <div className="thick-rule space-y-4 p-4">
      <h2 className="font-display font-bold text-foreground">Deal Sharing Rules</h2>

      <div className="rounded-sm border border-amber-200 bg-amber-50 p-2 dark:border-amber-800 dark:bg-amber-950/30">
        <p className="text-xs font-medium text-amber-700 dark:text-amber-500">
          Not following these rules may result in your account being temporarily
          or permanently blocked.
        </p>
      </div>

      <div>
        <p className="section-label mb-2 text-green-700 dark:text-green-500">Do</p>
        <ul className="list-disc space-y-1.5 pl-4 text-sm text-muted-foreground">
          {DO_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </div>

      <div>
        <p className="section-label mb-2 text-red-600 dark:text-red-500">Don&apos;t</p>
        <ul className="list-disc space-y-1.5 pl-4 text-sm text-muted-foreground">
          {DONT_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
