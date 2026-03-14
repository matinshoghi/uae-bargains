"use server";

import { createClient } from "@/lib/supabase/server";
import { contactSchema } from "@/lib/validations/contact";
import { notifyFormSubmitted } from "@/lib/notifications";
import { after } from "next/server";

export type ContactFormState = {
  errors?: Record<string, string[]>;
  success?: boolean;
} | null;

export async function submitContact(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const supabase = await createClient();

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    category: formData.get("category"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  // Rate limit: max 3 contact submissions per day per email
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: dailyCount } = await supabase
    .from("contact_submissions")
    .select("*", { count: "exact", head: true })
    .eq("email", parsed.data.email)
    .gte("created_at", oneDayAgo);

  if (dailyCount && dailyCount >= 3) {
    return {
      errors: {
        form: ["Too many submissions. Please try again tomorrow."],
      },
    };
  }

  const { error } = await supabase.from("contact_submissions").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    category: parsed.data.category,
    message: parsed.data.message,
  });

  if (error) {
    return { errors: { form: ["Failed to send message. Please try again."] } };
  }

  after(() => notifyFormSubmitted("Contact Form", parsed.data));

  return { success: true };
}
