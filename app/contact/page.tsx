import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the UAE Bargains team.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground">
          Contact Us
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We aim to respond within 48 hours.
        </p>
      </div>

      <hr className="mb-8 border-foreground/10" />

      <div className="mb-8 rounded-sm border-[1.5px] border-foreground/10 bg-muted/40 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Please note:</strong> UAE Bargains
          is not affiliated with any merchants listed on this website. For issues
          with a specific purchase or merchant, please contact that merchant
          directly.
        </p>
      </div>

      <ContactForm />
    </div>
  );
}
