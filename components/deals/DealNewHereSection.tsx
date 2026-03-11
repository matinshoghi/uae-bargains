const STEPS = [
  {
    number: "1",
    title: "Spot a deal",
    description: "Found something good? Share it with the community.",
  },
  {
    number: "2",
    title: "Vote on it",
    description: "Upvote the bangers, downvote the duds.",
  },
  {
    number: "3",
    title: "Everyone saves",
    description: "Best deals rise to the top. Never overpay.",
  },
];

export function DealNewHereSection() {
  return (
    <section className="mt-8 border border-[#d7d7d7] bg-[#efefef] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-[22px] font-semibold leading-tight tracking-tight text-[#222222] sm:text-2xl">
          👋 New to halasaves?
        </p>
        <p className="font-mono-display text-[11px] tracking-[0.08em] text-[#8f8f8f]">
          halasaves.com
        </p>
      </div>

      <div className="mt-5 space-y-6">
        {STEPS.map((step) => (
          <div key={step.number}>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-primary font-mono-display text-xs font-medium text-primary-foreground">
                {step.number}
              </span>
              <div>
                <p className="font-display text-[21px] font-semibold tracking-tight text-[#232323]">
                  {step.title}
                </p>
                <p className="mt-1 text-[14px] leading-relaxed text-[#8d8d8d]">
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
