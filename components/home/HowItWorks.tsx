const STEPS = [
  { num: "1", title: "Spot a deal", desc: "Found something good? Share it with the community." },
  { num: "2", title: "Vote on it", desc: "Upvote the bangers, downvote the duds." },
  { num: "3", title: "Everyone saves", desc: "Best deals rise to the top. Never overpay." },
];

export function HowItWorks() {
  return (
    <div className="w-full border-b-2 border-foreground bg-white">
      <div className="mx-auto max-w-[1100px] px-6 py-3.5">
        <div className="flex flex-col items-start gap-2.5 md:flex-row md:items-center md:justify-center md:gap-4">
          {STEPS.map((step, i) => (
            <div key={step.num} className="flex items-center gap-2.5">
              {i > 0 && (
                <span className="mr-2 hidden text-base text-muted-foreground/50 md:block">
                  →
                </span>
              )}
              <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center bg-foreground font-mono-display text-[13px] font-medium text-primary">
                {step.num}
              </span>
              <div>
                <span className="text-[13px] font-bold">{step.title}</span>
                <span className="mt-0.5 block max-w-[200px] text-xs leading-tight text-muted-foreground">
                  {step.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
