import { z } from "zod";

export const CONTACT_CATEGORIES = [
  "Support",
  "Deal Related",
  "General Enquiry",
] as const;

export type ContactCategory = (typeof CONTACT_CATEGORIES)[number];

export const contactSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be under 100 characters"),
  email: z.string().email("Must be a valid email address"),
  category: z.enum(CONTACT_CATEGORIES, {
    error: "Select a category",
  }),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be under 2000 characters"),
});

export type ContactInput = z.infer<typeof contactSchema>;
