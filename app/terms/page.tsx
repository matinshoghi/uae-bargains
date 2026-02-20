import type { Metadata } from "next";
import Link from "next/link";
import { ProseLayout } from "@/components/layout/ProseLayout";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of Use for UAE Bargains.",
};

export default function TermsPage() {
  return (
    <ProseLayout title="Terms of Use" subtitle="Last updated: February 2026">
      <section>
        <h2 className="text-lg font-semibold text-[#1d1d1f]">
          1. Acceptance of Terms
        </h2>
        <p className="mt-2 text-muted-foreground">
          By accessing or using UAE Bargains (&ldquo;the Service&rdquo;), you
          agree to be bound by these Terms of Use, our Deal Posting Guidelines,
          Commenting Guidelines, and{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-[#1d1d1f]"
          >
            Privacy Policy
          </Link>
          . If you do not agree to these terms, please do not use the Service.
          You must be at least 18 years old to use the Service.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1d1d1f]">
          2. Account Registration
        </h2>
        <p className="mt-2 text-muted-foreground">
          You must provide accurate information when creating an account. You are
          responsible for maintaining the security of your account credentials.
          Accounts are non-transferable. UAE Bargains reserves the right to
          refuse or terminate any registration at its discretion.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1d1d1f]">
          3. Proper Use
        </h2>
        <p className="mt-2 text-muted-foreground">You agree not to:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
          <li>Post unlawful, defamatory, harassing, or fraudulent content</li>
          <li>Post misleading deals or manipulate votes</li>
          <li>Infringe on intellectual property rights</li>
          <li>Hold multiple accounts without express authorisation</li>
          <li>Obstruct other users&apos; access to the Service</li>
          <li>Post spam, unsolicited promotions, or undisclosed affiliate links</li>
        </ul>
        <p className="mt-3 text-muted-foreground">
          Content that violates UAE law — including the UAE Cybercrime Law
          (Federal Decree-Law No. 34 of 2021) — is strictly prohibited and may
          result in account termination and referral to relevant authorities.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1d1d1f]">
          4. Content Ownership
        </h2>
        <p className="mt-2 text-muted-foreground">
          You retain ownership of content you post. By posting, you grant UAE
          Bargains a non-exclusive, royalty-free licence to display and
          distribute that content on the platform. You must not post content that
          infringes third-party intellectual property.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1d1d1f]">5. Privacy</h2>
        <p className="mt-2 text-muted-foreground">
          Your use of the Service is also governed by our{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-[#1d1d1f]"
          >
            Privacy Policy
          </Link>
          , which is incorporated into these Terms by reference. UAE Bargains may
          monitor and disclose information where required by law.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1d1d1f]">
          6. Account Termination
        </h2>
        <p className="mt-2 text-muted-foreground">
          You may deactivate your account at any time. UAE Bargains may suspend
          or terminate your account at any time, with or without notice, for
          conduct that violates these Terms or is otherwise harmful to the
          community, other users, or third parties.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-[#1d1d1f]">
          7. Limitation of Liability &amp; Governing Law
        </h2>
        <p className="mt-2 text-muted-foreground">
          UAE Bargains is provided on an &ldquo;as is&rdquo; basis. We make no
          warranties regarding the accuracy of deals posted by community
          members. UAE Bargains is not affiliated with any merchants listed on
          this website. Users indemnify UAE Bargains against all third-party
          claims, legal costs, and damages arising from use of the platform.
        </p>
        <p className="mt-3 text-muted-foreground">
          These Terms are governed by the laws of the United Arab Emirates.
        </p>
      </section>
    </ProseLayout>
  );
}
