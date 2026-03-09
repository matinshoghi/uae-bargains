import { z } from "zod";

function normalizeUrl(val: string): string {
  if (!val) return val;
  if (!/^https?:\/\//i.test(val)) {
    return `https://${val}`;
  }
  return val;
}

function slugify(val: string): string {
  return val
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const optionalUrl = z
  .union([z.string(), z.null()])
  .optional()
  .transform((val) => (val ? normalizeUrl(val) : ""))
  .pipe(z.string().url("Must be a valid URL").or(z.literal("")));

export const createStoreSchema = z.object({
  name: z
    .string()
    .min(1, "Store name is required")
    .max(100, "Name must be under 100 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug must be under 100 characters")
    .transform(slugify),
  website_url: optionalUrl,
  affiliate_network: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) => (val ?? "").trim()),
  description: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) => (val ?? "").trim()),
  is_active: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) => val === "on"),
  sort_order: z
    .union([z.string(), z.number(), z.null()])
    .optional()
    .transform((val) => {
      if (val === null || val === undefined || val === "") return 0;
      const num = Number(val);
      return isNaN(num) ? 0 : num;
    }),
});

export const createCouponSchema = z.object({
  store_id: z.string().uuid("Select a store"),
  code: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) => (val ?? "").trim())
    .pipe(z.string().max(50, "Code must be under 50 characters")),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be under 200 characters"),
  description: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) => (val ?? "").trim()),
  discount_type: z.enum(["percentage", "flat", "bogo", "free_shipping", "other"], {
    error: "Select a discount type",
  }),
  discount_value: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) => (val ?? "").trim()),
  min_purchase: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) => (val ?? "").trim()),
  url: optionalUrl,
  affiliate_url: optionalUrl,
  expires_at: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) => val ?? ""),
  is_verified: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) => val === "on"),
  is_featured: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) => val === "on"),
});

export const submitCouponSchema = z.object({
  store_id: z.string().uuid("Select a store"),
  code: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) => (val ?? "").trim())
    .pipe(z.string().max(50, "Code must be under 50 characters")),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be under 200 characters"),
  discount_type: z.enum(["percentage", "flat", "bogo", "free_shipping", "other"], {
    error: "Select a discount type",
  }),
  description: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) => (val ?? "").trim()),
  url: optionalUrl,
  expires_at: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) => val ?? ""),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>;
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type SubmitCouponInput = z.infer<typeof submitCouponSchema>;
