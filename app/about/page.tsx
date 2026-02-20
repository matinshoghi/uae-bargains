import type { Metadata } from "next";
import { ProseLayout } from "@/components/layout/ProseLayout";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about UAE Bargains — the community-driven deals platform for savvy shoppers across the UAE.",
};

export default function AboutPage() {
  return (
    <ProseLayout
      title="About UAE Bargains"
      subtitle="The community-driven deals platform for the UAE"
    >
      {/* Intro */}
      <section>
        <p>
          UAE Bargains is not just a website — it <strong>is</strong> you, the
          community of savvy shoppers across the UAE. Every deal you see was
          posted by a real person who wanted to share a great find with their
          neighbours.
        </p>
        <p className="mt-4">
          We built UAE Bargains because great deals deserve to be shared, not
          missed. Whether it&apos;s a flash sale at a mall, a discount code, or
          a free community event, UAE Bargains is where you find it first.
        </p>
      </section>

      {/* How it works */}
      <section>
        <h2 className="text-lg font-semibold text-[#1d1d1f]">How It Works</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            {
              step: "1",
              title: "Register",
              body: "Create a free account with your email or Google. No credit card required.",
            },
            {
              step: "2",
              title: "Submit Deals",
              body: "Found a great deal? Post it. Include the price, store, and a short description.",
            },
            {
              step: "3",
              title: "Vote",
              body: "Upvote deals you love. Downvote ones that aren\u2019t genuine. The community keeps things honest.",
            },
            {
              step: "4",
              title: "Discuss",
              body: "Leave comments to add context, share experiences, or ask questions about a deal.",
            },
          ].map(({ step, title, body }) => (
            <div key={step} className="rounded-lg border border-border p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Step {step}
              </div>
              <h3 className="font-semibold text-[#1d1d1f]">{title}</h3>
              <p className="mt-1 text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Community guidelines */}
      <section>
        <h2 className="text-lg font-semibold text-[#1d1d1f]">
          Community Guidelines
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
          <li>Post genuine, verifiable deals — misleading titles will be removed.</li>
          <li>Do not post referral links or spam.</li>
          <li>Respect other members in comments.</li>
          <li>Update or flag deals that have expired.</li>
          <li>No affiliate marketing without disclosure.</li>
        </ul>
      </section>

      {/* Merchants */}
      <section>
        <h2 className="text-lg font-semibold text-[#1d1d1f]">
          For Merchants
        </h2>
        <p className="mt-2 text-muted-foreground">
          Merchants are welcome to post deals on UAE Bargains under the same
          rules as everyone else. There are no listing fees. However, deals are
          judged by the community — if your deal isn&apos;t genuine, it will be
          downvoted.
        </p>
      </section>
    </ProseLayout>
  );
}
