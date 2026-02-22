import type { Metadata } from "next";
import Link from "next/link";
import { ProseLayout } from "@/components/layout/ProseLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for UAE Bargains.",
};

export default function PrivacyPage() {
  return (
    <ProseLayout title="Privacy Policy" subtitle="Last updated: February 2026">
      <section>
        <h2 className="font-display text-lg font-bold text-foreground">
          1. Information We Collect
        </h2>
        <p className="mt-2 text-muted-foreground">
          When you register, we collect your email address and, if you use
          Google sign-in, your public Google profile data (name and profile
          photo). Content you post — deals, comments, and votes — is stored and
          associated with your account. We also collect IP addresses for spam
          prevention and vote auditing purposes.
        </p>
        <p className="mt-3 text-muted-foreground">
          Guest visitors: we do not collect any personal data from
          unauthenticated users beyond standard server logs.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold text-foreground">
          2. Data Visibility
        </h2>
        <p className="mt-2 text-muted-foreground">
          Your username, display name, and posted content (deals, comments) are
          publicly visible. Your email address is never shown publicly. Votes you
          cast are aggregated and not attributed to you individually.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold text-foreground">3. Cookies</h2>
        <p className="mt-2 text-muted-foreground">
          We use session cookies to keep you signed in and maintain your
          preferences. We use Vercel Analytics to understand aggregate site
          usage. No advertising or third-party tracking cookies are used.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold text-foreground">
          4. Data Processors
        </h2>
        <p className="mt-2 text-muted-foreground">
          Your data is stored and processed by the following third-party
          services:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
          <li>
            <strong className="text-foreground">Supabase</strong> — database
            hosting and authentication
          </li>
          <li>
            <strong className="text-foreground">Vercel</strong> — application
            hosting and analytics
          </li>
        </ul>
        <p className="mt-3 text-muted-foreground">
          These processors operate under their own privacy frameworks and data
          protection policies.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold text-foreground">
          5. Your Rights
        </h2>
        <p className="mt-2 text-muted-foreground">
          You may access and modify your personal data at any time through your
          account settings. You may request a full export or deletion of your
          data by contacting us via the{" "}
          <Link
            href="/contact"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Contact Us
          </Link>{" "}
          page. We will process data requests within 30 days.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold text-foreground">
          6. Account Deactivation &amp; Deletion
        </h2>
        <p className="mt-2 text-muted-foreground">
          You may request full account deletion at any time. Upon deletion, your
          profile and personal data will be removed. Anonymised contributions
          (deals, comments) may remain to preserve community context but will be
          disassociated from your identity.
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold text-foreground">
          7. Changes to This Policy
        </h2>
        <p className="mt-2 text-muted-foreground">
          We may update this Privacy Policy from time to time. Changes will be
          posted on this page with an updated date. Continued use of the Service
          after changes constitutes acceptance.
        </p>
      </section>
    </ProseLayout>
  );
}
