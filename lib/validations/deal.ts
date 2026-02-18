import { z } from "zod";

function normalizeUrl(val: string): string {
  if (!val) return val;
  if (!/^https?:\/\//i.test(val)) {
    return `https://${val}`;
  }
  return val;
}

// Handles number fields that may be "", null, or undefined from FormData
const optionalPrice = z
  .union([z.string(), z.number(), z.null()])
  .optional()
  .transform((val) => {
    if (val === null || val === undefined || val === "") return undefined;
    const num = Number(val);
    return isNaN(num) ? undefined : num;
  });

export const createDealSchema = z
  .object({
    title: z
      .string()
      .min(5, "Title must be at least 5 characters")
      .max(120, "Title must be under 120 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(2000, "Description must be under 2000 characters"),
    is_free: z
      .union([z.string(), z.null()])
      .optional()
      .transform((val) => val === "on"),
    price: optionalPrice,
    original_price: optionalPrice,
    url: z
      .union([z.string(), z.null()])
      .optional()
      .transform((val) => (val ? normalizeUrl(val) : ""))
      .pipe(z.string().url("Must be a valid URL").or(z.literal(""))),
    location: z
      .union([z.string(), z.null()])
      .optional()
      .transform((val) => val ?? "")
      .pipe(z.string().max(200, "Location must be under 200 characters")),
    category_id: z.string().uuid("Select a category"),
    expires_at: z
      .union([z.string(), z.null()])
      .optional()
      .transform((val) => val ?? ""),
  })
  .refine(
    (data) => {
      if (data.is_free) return true;
      if (data.price != null && data.original_price != null) {
        return data.original_price > data.price;
      }
      return true;
    },
    {
      message: "Original price must be higher than deal price",
      path: ["original_price"],
    }
  )
  .refine(
    (data) => {
      if (data.price != null && data.price < 0) return false;
      return true;
    },
    { message: "Price must be 0 or more", path: ["price"] }
  )
  .refine(
    (data) => {
      if (data.original_price != null && data.original_price <= 0) return false;
      return true;
    },
    { message: "Original price must be a positive number", path: ["original_price"] }
  )
  .refine(
    (data) => {
      if (!data.expires_at) return true;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiry = new Date(data.expires_at + "T00:00:00");
      return expiry >= today;
    },
    { message: "Expiry date cannot be in the past", path: ["expires_at"] }
  );

export type CreateDealInput = z.infer<typeof createDealSchema>;
