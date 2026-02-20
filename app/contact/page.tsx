import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the UAE Bargains team.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f]">
          Contact Us
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We aim to respond within 48 hours.
        </p>
      </div>

      <Separator className="mb-8" />

      {/* Merchant disclaimer */}
      <div className="mb-8 rounded-lg border border-border bg-muted/40 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          <strong className="text-[#1d1d1f]">Please note:</strong> UAE Bargains
          is not affiliated with any merchants listed on this website. For issues
          with a specific purchase or merchant, please contact that merchant
          directly.
        </p>
      </div>

      <ContactForm />
    </div>
  );
}
