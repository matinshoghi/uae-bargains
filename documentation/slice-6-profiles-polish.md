# Slice 6 — Profiles + Polish

> **Goal:** User profile pages, settings, deal expiration, loading states, error handling, SEO.
> **Duration:** Days 11–13
> **Depends on:** Slices 1–5 (all core features)

---

## Overview

This slice rounds out the user experience. It adds public user profiles, a settings page for editing profile info, deal expiration automation, and all the polish that makes the app feel finished: loading skeletons, error boundaries, empty states, toasts, and SEO metadata.

---

## 1. User Profile Page

### Route: `app/user/[username]/page.tsx`

**Server Component** that:
1. Fetches profile by username
2. Fetches deals posted by this user
3. Returns 404 if username doesn't exist

### Component: `components/user/UserProfile.tsx` (Server Component)

**Layout:**

```
┌──────────────────────────────────────────────────┐
│  [Large Avatar]                                  │
│  Display Name                                    │
│  @username · Member since Feb 2026               │
│                                                  │
│  Deals posted: 12    Total upvotes: 87           │
│                                                  │
│  ─────────────────────────────────────────        │
│  Their Deals                                     │
│  [DealCard] [DealCard] [DealCard] ...            │
└──────────────────────────────────────────────────┘
```

**Data:**
- Profile: display_name, username, avatar_url, created_at
- Stats: count of deals posted, sum of upvote_count across their deals
- Deal list: reuse `DealCard` from Slice 3, filtered by user_id

### Query — `lib/queries/profiles.ts`

```typescript
import { createClient } from "@/lib/supabase/server";

export async function fetchProfileByUsername(username: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error) return null;
  return data;
}

export async function fetchUserStats(userId: string) {
  const supabase = await createClient();

  const { data: deals } = await supabase
    .from("deals")
    .select("id, upvote_count")
    .eq("user_id", userId);

  return {
    dealCount: deals?.length ?? 0,
    totalUpvotes: deals?.reduce((sum, d) => sum + d.upvote_count, 0) ?? 0,
  };
}

export async function fetchUserDeals(userId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("deals")
    .select(`
      *,
      profiles!inner(username, display_name, avatar_url),
      categories!inner(label, slug, icon)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return data ?? [];
}
```

### SEO Metadata

```typescript
export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = await fetchProfileByUsername(username);

  if (!profile) return { title: "User Not Found — UAE Bargains" };

  return {
    title: `${profile.display_name} (@${profile.username}) — UAE Bargains`,
    description: `View deals posted by ${profile.display_name} on UAE Bargains.`,
  };
}
```

---

## 2. Settings Page

### Route: `app/settings/page.tsx`

**Auth-gated Server Component** — redirects to `/login` if not signed in.

### Component: `components/user/SettingsForm.tsx` (Client Component)

**Fields:**

| Field | Type | Notes |
|-------|------|-------|
| Display Name | Text input | Pre-filled with current value |
| Username | Text input | Pre-filled, must be unique |
| Avatar | File upload | Shows current avatar with "Change" option |

**Server Action — `lib/actions/profile.ts`:**

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateProfileSchema = z.object({
  display_name: z.string().min(1).max(50),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, hyphens, and underscores"),
});

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be signed in");

  const parsed = updateProfileSchema.safeParse({
    display_name: formData.get("display_name"),
    username: formData.get("username"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // Handle avatar upload
  let avatar_url: string | undefined;
  const avatarFile = formData.get("avatar") as File | null;

  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split(".").pop();
    const filePath = `avatars/${user.id}.${fileExt}`;

    await supabase.storage.from("deal-images").upload(filePath, avatarFile, { upsert: true });

    const { data: publicUrl } = supabase.storage.from("deal-images").getPublicUrl(filePath);
    avatar_url = publicUrl.publicUrl;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      ...parsed.data,
      ...(avatar_url && { avatar_url }),
    })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { error: { username: ["This username is already taken"] } };
    }
    return { error: { form: [error.message] } };
  }

  revalidatePath("/settings");
  revalidatePath(`/user/${parsed.data.username}`);
}
```

---

## 3. Deal Expiration Automation

### Cron Job (Supabase pg_cron)

```sql
SELECT cron.schedule(
  'expire-deals',
  '0 * * * *',  -- Every hour
  $$
  UPDATE deals
  SET status = 'expired'
  WHERE expires_at < now()
    AND status = 'active'
  $$
);
```

### Visual Treatment

Expired deals (from any source — cron or manual check):

- **Feed card:** `opacity-60` overlay + red "Expired" badge in top-right corner
- **Detail page:** "Expired" banner at top, "Go to Deal" button disabled
- **Feed sorting:** Expired deals sort lower (they naturally have 0 hot_score once expired)

No removal — expired deals stay visible for reference and SEO.

---

## 4. Loading Skeletons

Use shadcn's `<Skeleton>` component. Create skeletons for the main loading states.

### 4.1 `app/loading.tsx` — Homepage Skeleton

```typescript
import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4">
      {/* Sort tabs skeleton */}
      <div className="flex gap-2 mb-4 border-b border-zinc-100 pb-3">
        <Skeleton className="h-8 w-16 rounded-md" />
        <Skeleton className="h-8 w-16 rounded-md" />
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>

      {/* Deal card skeletons */}
      {Array.from({ length: 5 }).map((_, i) => (
        <DealCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

### 4.2 `components/deals/DealCardSkeleton.tsx`

```typescript
export function DealCardSkeleton() {
  return (
    <div className="flex gap-4 p-4 rounded-xl border border-zinc-100 mb-3">
      <div className="flex flex-col items-center gap-1">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-4 w-6" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <Skeleton className="h-20 w-20 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}
```

### 4.3 `app/deals/[id]/loading.tsx` — Deal Detail Skeleton

Similar pattern: skeleton blocks for title, image area, price, description, comments.

---

## 5. Error Handling

### 5.1 `app/error.tsx` — Global Error Boundary

```typescript
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-sm text-zinc-500 mb-4">
        We hit an unexpected error. Please try again.
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg
                   hover:bg-emerald-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
```

### 5.2 `app/not-found.tsx` — 404 Page

```typescript
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <h2 className="text-xl font-semibold mb-2">Page not found</h2>
      <p className="text-sm text-zinc-500 mb-4">
        The page you're looking for doesn't exist or has been removed.
      </p>
      <Link
        href="/"
        className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg
                   hover:bg-emerald-700 transition-colors"
      >
        Back to deals
      </Link>
    </div>
  );
}
```

### 5.3 Deal-level `not-found.tsx`

`app/deals/[id]/not-found.tsx` — specific message for missing deals.

---

## 6. Toast Notifications

Use shadcn's toast system for action feedback.

**Where toasts appear:**
- Deal posted successfully: "Deal posted!"
- Comment posted: "Comment added"
- Vote error: "Failed to vote. Please try again."
- Profile updated: "Profile updated"
- Sign out: "Signed out"

**Setup:**
1. Add `<Toaster />` to `app/layout.tsx`
2. Use `toast()` function in Client Components after successful Server Actions

---

## 7. SEO Metadata

### 7.1 Root Layout Metadata — `app/layout.tsx`

```typescript
export const metadata: Metadata = {
  title: {
    default: "UAE Bargains — Community Deals for UAE",
    template: "%s — UAE Bargains",
  },
  description: "Discover and share the best deals in UAE. Community-driven bargains on electronics, dining, fashion, groceries, and travel.",
  openGraph: {
    type: "website",
    locale: "en_AE",
    siteName: "UAE Bargains",
  },
};
```

### 7.2 Per-Page Metadata

Already covered in Slices 2 and 6:
- Deal detail: dynamic title + description from deal content
- User profile: dynamic title from username
- Category page: "Electronics Deals — UAE Bargains"

### 7.3 Sitemap (Optional, post-MVP)

Not essential for MVP but easy to add later with Next.js `app/sitemap.ts`.

---

## 8. Minor Polish Items

### 8.1 `TimeAgo` Component — `components/shared/TimeAgo.tsx`

```typescript
import { formatDistanceToNow } from "date-fns";

export function TimeAgo({ date }: { date: string }) {
  return (
    <time dateTime={date} title={new Date(date).toLocaleString()}>
      {formatDistanceToNow(new Date(date), { addSuffix: true })}
    </time>
  );
}
```

### 8.2 Avatar Fallback — `components/shared/Avatar.tsx`

```typescript
import { Avatar as ShadcnAvatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserAvatar({
  src,
  name,
  size = "sm",
}: {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-16 w-16" };
  const initial = name.charAt(0).toUpperCase();

  return (
    <ShadcnAvatar className={sizeClasses[size]}>
      {src && <AvatarImage src={src} alt={name} />}
      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-medium">
        {initial}
      </AvatarFallback>
    </ShadcnAvatar>
  );
}
```

### 8.3 Link to User Profile from Deal Card / Comments

Ensure all usernames in deal cards and comments link to `/user/[username]`.

### 8.4 "Post Deal" CTA Behavior

- Desktop header: always visible as a button
- Mobile: appears in bottom nav as center "+" icon
- Both link to `/deals/new`
- If not logged in, `/deals/new` redirects to login with return URL

---

## 9. File Structure After This Slice

```
lib/
  queries/
    profiles.ts                — fetchProfileByUsername, fetchUserStats, fetchUserDeals
  actions/
    profile.ts                 — updateProfile Server Action
  validations/
    profile.ts                 — Zod schema for profile updates

components/
  user/
    UserProfile.tsx            — (Server) Profile page content
    SettingsForm.tsx            — (Client) Edit profile form
  deals/
    DealCardSkeleton.tsx       — (Server) Loading skeleton for cards
  shared/
    TimeAgo.tsx                — (Server) Relative time display
    Avatar.tsx                 — (Server) User avatar with fallback

app/
  user/
    [username]/
      page.tsx                 — Public profile page
      loading.tsx              — Profile skeleton
  settings/
    page.tsx                   — Edit profile (auth-gated)
  loading.tsx                  — Homepage skeleton
  error.tsx                    — Global error boundary
  not-found.tsx                — 404 page
  deals/
    [id]/
      not-found.tsx            — Deal not found page
      loading.tsx              — Deal detail skeleton
```

---

## 10. Design Notes (Revamp-Friendly)

- Skeletons match the shape of actual components — update them when you revamp the card layout
- Error/404 pages are simple centered text — easy to restyle
- `UserAvatar` wraps shadcn's Avatar — swap the fallback colors during revamp
- `TimeAgo` uses `date-fns` — locale-aware, can add Arabic later
- Toast styles come from shadcn — customizable via CSS variables
- Profile page reuses `DealCard` — no separate "user deal" component to maintain

---

## Test Cases

### T6.1 — User Profile Page
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Profile loads | Navigate to `/user/[valid-username]` | Display name, avatar, join date, stats shown |
| 2 | 404 for invalid user | Navigate to `/user/nonexistent` | 404 page shown |
| 3 | User's deals listed | View profile of user with 3 deals | All 3 deal cards displayed |
| 4 | No deals yet | View profile of user with 0 deals | "No deals posted yet" message |
| 5 | Stats correct | User has 5 deals totaling 40 upvotes | "5 deals posted" and "40 upvotes received" |
| 6 | Profile link from deal | Click username on a deal card | Navigates to correct user profile |
| 7 | Profile link from comment | Click username on a comment | Navigates to correct user profile |

### T6.2 — Settings Page
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Settings loads pre-filled | Navigate to `/settings` while logged in | Current display name and username pre-filled |
| 2 | Auth gate | Navigate to `/settings` while logged out | Redirected to `/login` |
| 3 | Update display name | Change name, submit | Name updated, toast shown, reflects on profile |
| 4 | Update username | Change username, submit | Username updated, profile URL changes |
| 5 | Duplicate username | Enter an existing username | Error: "This username is already taken" |
| 6 | Invalid username chars | Enter "user name!" | Error: regex validation message |
| 7 | Upload avatar | Select new image, submit | Avatar updated on profile and in header |
| 8 | Username too short | Enter "ab" | Error: min 3 characters |

### T6.3 — Deal Expiration
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Deal expires via cron | Create deal with expiry 1 hour from now, wait | Status changes to 'expired' after cron runs |
| 2 | Expired visual in feed | View expired deal in homepage feed | Card has `opacity-60` + "Expired" badge |
| 3 | Expired detail page | View expired deal's detail page | "Expired" banner, disabled "Go to Deal" button |
| 4 | No-expiry deal stays active | Create deal without expiry | Remains active indefinitely |
| 5 | Expired deals still accessible | Navigate to expired deal URL | Page loads normally (not 404), just marked expired |

### T6.4 — Loading States
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Homepage skeleton | Navigate to `/` (slow connection simulated) | Skeleton cards shown while loading |
| 2 | Deal detail skeleton | Navigate to `/deals/[id]` | Skeleton blocks for title, image, price shown |
| 3 | Profile skeleton | Navigate to `/user/[username]` | Skeleton for avatar, name, stats shown |
| 4 | Skeleton matches layout | Compare skeleton to loaded state | Skeleton shapes match actual content areas |

### T6.5 — Error Handling
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Global error boundary | Trigger a server error | Error page shown with "Try again" button |
| 2 | 404 page | Navigate to `/nonexistent-route` | 404 page with "Back to deals" link |
| 3 | Deal not found | Navigate to `/deals/invalid-uuid` | Deal-specific 404 message |
| 4 | Reset works | Click "Try again" on error page | Page attempts to reload |

### T6.6 — Toast Notifications
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Deal posted toast | Submit a new deal | "Deal posted!" toast appears briefly |
| 2 | Comment toast | Post a comment | "Comment added" toast |
| 3 | Profile updated toast | Update settings | "Profile updated" toast |
| 4 | Toast auto-dismisses | Trigger any toast | Disappears after ~3 seconds |

### T6.7 — SEO
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Homepage title | Check `<title>` tag | "UAE Bargains — Community Deals for UAE" |
| 2 | Deal page title | Check `<title>` on deal page | "[Deal Title] — UAE Bargains" |
| 3 | User profile title | Check `<title>` on profile | "[Name] (@username) — UAE Bargains" |
| 4 | OG tags present | View page source on deal page | og:title, og:description, og:image |
| 5 | Category page title | View `/category/electronics` | "Electronics Deals — UAE Bargains" |

### T6.8 — Mobile Polish
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Bottom nav works | Tap each item on mobile | Navigates to correct page, active state shown |
| 2 | Safe area padding | Test on iPhone (or simulator) | Content not hidden behind home bar |
| 3 | Touch targets | Test all buttons on mobile | All interactive elements at least 44x44px |
| 4 | No horizontal overflow | Scroll horizontally on any page | No content bleeds outside viewport |
