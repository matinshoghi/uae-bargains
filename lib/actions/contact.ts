"use server";

import { createClient } from "@/lib/supabase/server";
import { contactSchema } from "@/lib/validations/contact";

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

  const { error } = await supabase.from("contact_submissions").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    category: parsed.data.category,
    message: parsed.data.message,
  });

  if (error) {
    return { errors: { form: ["Failed to send message. Please try again."] } };
  }

  return { success: true };
}
