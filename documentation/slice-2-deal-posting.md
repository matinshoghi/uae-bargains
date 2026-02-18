# Slice 2 — Deal Posting + Detail Page

> **Goal:** Users can submit a deal and view its full detail page.
> **Duration:** Days 3–4
> **Depends on:** Slice 1 (auth, database, layout)

---

## Overview

This slice delivers the core action: posting a deal. It also builds the deal detail page where a single deal is displayed with all its information. No feed yet (Slice 3), no voting (Slice 4), no comments (Slice 5) — just create and view.

---

## 1. Deal Submission Form

### Route: `app/deals/new/page.tsx`

**Server Component wrapper:**
- Check auth — redirect to `/login` if not signed in
- Fetch categories from Supabase (for the dropdown)
- Pass categories to `<DealForm />`

### Component: `components/deals/DealForm.tsx` (Client Component)

**Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Title | Text input | Yes | 5–120 characters |
| Description | Textarea | Yes | 10–2000 characters |
| Price (AED) | Number input | No | Positive number, max 2 decimals |
| Original Price (AED) | Number input | No | Must be > price if both provided |
| Deal URL | URL input | No | Valid URL format |
| Location | Text input | No | Max 200 characters |
| Category | Select dropdown | Yes | Must be a valid category ID |
| Expiry Date | Date picker | No | Must be in the future |
| Image | File upload | No | JPEG/PNG/WebP, max 5MB |

**Form behavior:**
- Use React 19 `useActionState` for form submission with Server Actions
- Show inline validation errors per field (Zod)
- Disable submit button while pending
- Image preview shown immediately after selection via `URL.createObjectURL()`
- On success: redirect to `/deals/[id]`
- On error: show toast with error message, form stays populated

### Zod Validation Schema — `lib/validations/deal.ts`

```typescript
import { z } from "zod";

export const createDealSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(120),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  price: z.coerce.number().positive().optional().nullable(),
  original_price: z.coerce.number().positive().optional().nullable(),
  url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  location: z.string().max(200).optional().or(z.literal("")),
  category_id: z.string().uuid("Select a category"),
  expires_at: z.string().optional().or(z.literal("")),
}).refine(
  (data) => {
    if (data.price && data.original_price) {
      return data.original_price > data.price;
    }
    return true;
  },
  { message: "Original price must be higher than deal price", path: ["original_price"] }
);
```

---

## 2. Server Action — `lib/actions/deals.ts`

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { createDealSchema } from "@/lib/validations/deal";
import { redirect } from "next/navigation";

export async function createDeal(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be signed in");

  // Parse and validate
  const raw = Object.fromEntries(formData);
  const parsed = createDealSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { title, description, price, original_price, url, location, category_id, expires_at } = parsed.data;

  // Handle image upload (if present)
  let image_url: string | null = null;
  const imageFile = formData.get("image") as File | null;

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split(".").pop();
    const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("deal-images")
      .upload(filePath, imageFile);

    if (uploadError) {
      return { error: { image: ["Failed to upload image"] } };
    }

    const { data: publicUrl } = supabase.storage
      .from("deal-images")
      .getPublicUrl(filePath);

    image_url = publicUrl.publicUrl;
  }

  // Insert deal
  const { data: deal, error } = await supabase
    .from("deals")
    .insert({
      user_id: user.id,
      category_id,
      title,
      description,
      price: price ?? null,
      original_price: original_price ?? null,
      url: url || null,
      location: location || null,
      image_url,
      expires_at: expires_at || null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: { form: [error.message] } };
  }

  redirect(`/deals/${deal.id}`);
}
```

---

## 3. Image Upload Strategy

**Client-side:**
- Validate file type (accept `image/jpeg, image/png, image/webp`) and size (<5MB) before upload
- Show preview immediately using `URL.createObjectURL()`
- Send as part of FormData to the Server Action

**Server-side:**
- Upload to Supabase Storage bucket `deal-images`
- Path: `{userId}/{uuid}.{ext}` — organized by user for easy cleanup
- Store the public URL in `deals.image_url`

**Display:**
- Use Next.js `<Image>` component everywhere for automatic optimization
- Feed card thumbnail: `width={160} height={160}` with `object-cover`
- Detail page: `width={600} height={400}` with `object-contain`

**No client-side compression for now.** Keep it simple. Supabase has a 50MB default limit; our 5MB validation is enough.

---

## 4. Deal Detail Page

### Route: `app/deals/[id]/page.tsx`

**Server Component:**
- Fetch deal by ID with joins: `profiles` (poster info) + `categories` (category label)
- Return 404 if deal not found
- Generate dynamic metadata for SEO/Open Graph

### Component: `components/deals/DealDetail.tsx` (Server Component)

**Layout (top to bottom):**

1. **Category pill + time ago** — "Electronics · 2 hours ago"
2. **Title** — Large, bold
3. **Image** — Full-width if present, rounded, with placeholder if missing
4. **Price block:**
   - Deal price: `AED 299` in large emerald text
   - Original price: `~~AED 599~~` strikethrough
   - Discount badge: `-50%` pill
   - "Free" badge if price is 0 or null
5. **Description** — Full text, preserving line breaks
6. **Metadata row:**
   - External link button: "Go to Deal →" (opens in new tab)
   - Location if present: map pin icon + text
   - Expiry: calendar icon + "Expires Mar 5" or "Expired" in red
7. **Posted by:** Avatar + username + link to profile
8. **Vote buttons placeholder** — renders but non-functional until Slice 4
9. **Comments section placeholder** — "Comments coming soon" until Slice 5

### SEO — `generateMetadata`

```typescript
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Fetch deal title + description for OG tags
  return {
    title: `${deal.title} — UAE Bargains`,
    description: deal.description.slice(0, 160),
    openGraph: {
      title: deal.title,
      description: deal.description.slice(0, 160),
      images: deal.image_url ? [deal.image_url] : [],
    },
  };
}
```

---

## 5. Expired Deal Handling

- If `expires_at < now()` or `status === 'expired'`: show "Expired" badge in red
- Entire card/detail gets `opacity-60` treatment
- "Go to Deal" button becomes disabled with "This deal has expired" text
- Expired deals are still viewable (not deleted) — important for SEO and history

---

## 6. File Structure After This Slice

```
lib/
  validations/
    deal.ts                    — Zod schema for deal creation
  actions/
    deals.ts                   — createDeal Server Action

components/
  deals/
    DealForm.tsx               — (Client) Multi-field form with image upload
    DealDetail.tsx             — (Server) Full deal display
    DealPriceBadge.tsx         — (Server) Price + original price + discount %
    DealExpiredBadge.tsx       — (Server) "Expired" red badge

app/
  deals/
    new/
      page.tsx                 — Submit deal page (auth-gated)
    [id]/
      page.tsx                 — Deal detail page
      loading.tsx              — Skeleton loader
```

---

## 7. Design Notes (Revamp-Friendly)

- `DealForm` should use shadcn `<Input>`, `<Textarea>`, `<Select>`, `<Button>` — no custom form elements
- `DealDetail` receives a typed deal object as a prop, not a Supabase client — data fetching stays in the page
- `DealPriceBadge` is a standalone component that takes `price`, `originalPrice`, `discountPercentage` as props — reused in both detail and cards (Slice 3)
- Keep the form layout simple: single column, stacked fields. No multi-step wizard. Easy to restyle later.

---

## Test Cases

### T2.1 — Deal Form Validation
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Empty form submit | Click submit with no fields filled | Validation errors shown on title, description, category |
| 2 | Title too short | Enter "Hi" as title, fill rest | Error: "Title must be at least 5 characters" |
| 3 | Description too short | Enter "Bad" as description | Error: "Description must be at least 10 characters" |
| 4 | Invalid URL | Enter "not-a-url" in URL field | Error: "Must be a valid URL" |
| 5 | Original price < deal price | Price: 500, Original: 300 | Error: "Original price must be higher than deal price" |
| 6 | Past expiry date | Set expiry to yesterday | Error or warning about past date |
| 7 | Valid minimum fields | Fill title + description + category only | Form submits successfully |
| 8 | Valid all fields | Fill every field with valid data | Form submits, redirects to deal page |

### T2.2 — Image Upload
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Upload valid image | Select a JPEG under 5MB | Preview shown, uploads on submit, visible on detail page |
| 2 | Upload too large | Select a 10MB image | Client-side error: "Image must be under 5MB" |
| 3 | Upload wrong type | Select a .pdf file | Client-side error: only JPEG/PNG/WebP accepted |
| 4 | No image | Submit form without image | Deal created successfully, no image shown on detail page |
| 5 | Image displays correctly | View deal with image on detail page | Image rendered via Next.js `<Image>` with proper sizing |

### T2.3 — Deal Detail Page
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Deal loads correctly | Navigate to `/deals/[valid-id]` | All deal fields displayed correctly |
| 2 | 404 for invalid ID | Navigate to `/deals/nonexistent-uuid` | 404 page shown |
| 3 | Price display | Deal with price 299 and original 599 | Shows "AED 299", "~~AED 599~~", "-50%" badge |
| 4 | Free deal | Deal with price 0 or null | Shows "Free" badge |
| 5 | No price deal | Deal with no price fields | No price section shown |
| 6 | External link | Click "Go to Deal" button | Opens deal URL in new tab |
| 7 | No external link | Deal without URL | "Go to Deal" button not shown |
| 8 | Location shown | Deal with location "Dubai Mall" | Map pin icon + "Dubai Mall" displayed |
| 9 | Expiry shown | Deal with future expiry | Calendar icon + formatted date shown |
| 10 | Expired deal | Deal with past expiry | "Expired" badge, dimmed card, disabled "Go to Deal" |
| 11 | Poster info | View any deal | Avatar + username of poster shown, links to their profile |

### T2.4 — Auth Gate
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Logged out → new deal | Navigate to `/deals/new` while logged out | Redirected to `/login` |
| 2 | Logged in → new deal | Navigate to `/deals/new` while logged in | Form loads correctly |
| 3 | Deal links to poster | View deal, check user_id | Shows correct poster's username and avatar |

### T2.5 — SEO Metadata
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Page title | View page source or browser tab | Title: "[Deal Title] — UAE Bargains" |
| 2 | OG tags | Inspect `<meta>` tags | og:title, og:description, og:image present |
| 3 | Description truncated | Deal with long description | og:description is max 160 chars |
