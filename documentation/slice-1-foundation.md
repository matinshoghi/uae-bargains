# Slice 1 — Foundation

> **Goal:** Project skeleton, Supabase connected, auth working, base layout in place.
> **Duration:** Days 1–2

---

## Overview

This slice establishes everything the rest of the app depends on: dependencies, Supabase project, database schema, authentication, and the root layout shell. No deal-specific features yet — just the infrastructure.

---

## 1. Dependencies to Install

```bash
# Supabase
npm install @supabase/supabase-js @supabase/ssr

# UI
npx shadcn@latest init
npm install lucide-react

# Utilities
npm install date-fns zod

# Dev
npm install -D supabase
```

**shadcn/ui init options:**
- Style: Default
- Base color: Zinc
- CSS variables: Yes
- Tailwind CSS: v4 (auto-detected)
- RSC: Yes

**shadcn components to add immediately:**
```bash
npx shadcn@latest add button card input label textarea select badge avatar dropdown-menu toast skeleton separator sheet
```

---

## 2. Environment Variables

Create `.env.local` (gitignored):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Add to `.gitignore` if not already present:
```
.env.local
.env*.local
```

---

## 3. Supabase Project Setup

### 3.1 Create Supabase Project

1. Go to supabase.com → New Project
2. Name: `uae-bargains`
3. Region: Choose closest to UAE (e.g., `ap-south-1` Mumbai or `me-south-1` if available)
4. Generate and save the database password

### 3.2 Database Schema — Full SQL

Run this in the Supabase SQL Editor in order:

```sql
-- ============================================
-- 1. PROFILES (extends auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  reputation INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'preferred_username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 2. CATEGORIES (static seed data)
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT USING (true);

-- Seed categories
INSERT INTO categories (name, label, slug, icon, sort_order) VALUES
  ('electronics', 'Electronics', 'electronics', 'Smartphone', 1),
  ('dining', 'Dining', 'dining', 'UtensilsCrossed', 2),
  ('fashion', 'Fashion', 'fashion', 'Shirt', 3),
  ('groceries', 'Groceries', 'groceries', 'ShoppingCart', 4),
  ('travel', 'Travel', 'travel', 'Plane', 5);

-- ============================================
-- 3. DEALS
-- ============================================
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2),
  original_price NUMERIC(10,2),
  discount_percentage INTEGER GENERATED ALWAYS AS (
    CASE WHEN original_price > 0 AND price IS NOT NULL
      THEN ROUND(((original_price - price) / original_price) * 100)
      ELSE NULL
    END
  ) STORED,
  url TEXT,
  location TEXT,
  image_url TEXT,
  expires_at TIMESTAMPTZ,
  upvote_count INTEGER DEFAULT 0,
  downvote_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  hot_score FLOAT DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'removed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active deals are viewable by everyone"
  ON deals FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create deals"
  ON deals FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deals"
  ON deals FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own deals"
  ON deals FOR DELETE USING (auth.uid() = user_id);

-- Indexes for feed queries
CREATE INDEX idx_deals_hot ON deals(hot_score DESC, created_at DESC) WHERE status = 'active';
CREATE INDEX idx_deals_new ON deals(created_at DESC) WHERE status = 'active';
CREATE INDEX idx_deals_top ON deals((upvote_count - downvote_count) DESC, created_at DESC) WHERE status = 'active';
CREATE INDEX idx_deals_category ON deals(category_id, created_at DESC) WHERE status = 'active';
CREATE INDEX idx_deals_user ON deals(user_id, created_at DESC);

-- ============================================
-- 4. COMMENTS (threaded)
-- ============================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  depth INTEGER DEFAULT 0,
  upvote_count INTEGER DEFAULT 0,
  downvote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_comments_deal ON comments(deal_id, created_at ASC);
CREATE INDEX idx_comments_parent ON comments(parent_id);

-- ============================================
-- 5. VOTES (unified for deals + comments)
-- ============================================
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  vote_type SMALLINT NOT NULL CHECK (vote_type IN (1, -1)),
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),

  CHECK (
    (deal_id IS NOT NULL AND comment_id IS NULL) OR
    (deal_id IS NULL AND comment_id IS NOT NULL)
  )
);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own votes"
  ON votes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create votes"
  ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes"
  ON votes FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
  ON votes FOR DELETE USING (auth.uid() = user_id);

-- One vote per user per deal/comment
CREATE UNIQUE INDEX idx_votes_user_deal ON votes(user_id, deal_id) WHERE deal_id IS NOT NULL;
CREATE UNIQUE INDEX idx_votes_user_comment ON votes(user_id, comment_id) WHERE comment_id IS NOT NULL;
CREATE INDEX idx_votes_deal ON votes(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX idx_votes_comment ON votes(comment_id) WHERE comment_id IS NOT NULL;

-- ============================================
-- 6. TRIGGERS — Vote count sync
-- ============================================

-- Deal vote counts
CREATE OR REPLACE FUNCTION sync_deal_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.deal_id IS NOT NULL THEN
    UPDATE deals SET
      upvote_count = upvote_count + CASE WHEN NEW.vote_type = 1 THEN 1 ELSE 0 END,
      downvote_count = downvote_count + CASE WHEN NEW.vote_type = -1 THEN 1 ELSE 0 END
    WHERE id = NEW.deal_id;

  ELSIF TG_OP = 'DELETE' AND OLD.deal_id IS NOT NULL THEN
    UPDATE deals SET
      upvote_count = upvote_count - CASE WHEN OLD.vote_type = 1 THEN 1 ELSE 0 END,
      downvote_count = downvote_count - CASE WHEN OLD.vote_type = -1 THEN 1 ELSE 0 END
    WHERE id = OLD.deal_id;

  ELSIF TG_OP = 'UPDATE' AND NEW.deal_id IS NOT NULL THEN
    UPDATE deals SET
      upvote_count = upvote_count
        - CASE WHEN OLD.vote_type = 1 THEN 1 ELSE 0 END
        + CASE WHEN NEW.vote_type = 1 THEN 1 ELSE 0 END,
      downvote_count = downvote_count
        - CASE WHEN OLD.vote_type = -1 THEN 1 ELSE 0 END
        + CASE WHEN NEW.vote_type = -1 THEN 1 ELSE 0 END
    WHERE id = NEW.deal_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vote_change_deal
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION sync_deal_vote_counts();

-- Comment vote counts
CREATE OR REPLACE FUNCTION sync_comment_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.comment_id IS NOT NULL THEN
    UPDATE comments SET
      upvote_count = upvote_count + CASE WHEN NEW.vote_type = 1 THEN 1 ELSE 0 END,
      downvote_count = downvote_count + CASE WHEN NEW.vote_type = -1 THEN 1 ELSE 0 END
    WHERE id = NEW.comment_id;

  ELSIF TG_OP = 'DELETE' AND OLD.comment_id IS NOT NULL THEN
    UPDATE comments SET
      upvote_count = upvote_count - CASE WHEN OLD.vote_type = 1 THEN 1 ELSE 0 END,
      downvote_count = downvote_count - CASE WHEN OLD.vote_type = -1 THEN 1 ELSE 0 END
    WHERE id = OLD.comment_id;

  ELSIF TG_OP = 'UPDATE' AND NEW.comment_id IS NOT NULL THEN
    UPDATE comments SET
      upvote_count = upvote_count
        - CASE WHEN OLD.vote_type = 1 THEN 1 ELSE 0 END
        + CASE WHEN NEW.vote_type = 1 THEN 1 ELSE 0 END,
      downvote_count = downvote_count
        - CASE WHEN OLD.vote_type = -1 THEN 1 ELSE 0 END
        + CASE WHEN NEW.vote_type = -1 THEN 1 ELSE 0 END
    WHERE id = NEW.comment_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vote_change_comment
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION sync_comment_vote_counts();

-- Comment count on deals
CREATE OR REPLACE FUNCTION sync_deal_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE deals SET comment_count = comment_count + 1 WHERE id = NEW.deal_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE deals SET comment_count = comment_count - 1 WHERE id = OLD.deal_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_comment_change
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION sync_deal_comment_count();

-- ============================================
-- 7. HOT SCORE function
-- ============================================
CREATE OR REPLACE FUNCTION calculate_hot_score(
  p_upvotes INTEGER,
  p_downvotes INTEGER,
  p_created_at TIMESTAMPTZ
) RETURNS FLOAT AS $$
DECLARE
  net_score FLOAT;
  hours FLOAT;
BEGIN
  net_score := GREATEST(p_upvotes - p_downvotes - 1, 0);
  hours := EXTRACT(EPOCH FROM (now() - p_created_at)) / 3600.0;
  RETURN net_score / POWER(hours + 2, 1.5);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Recalculate hot score on vote changes
CREATE OR REPLACE FUNCTION update_deal_hot_score()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.deal_id IS NOT NULL THEN
    UPDATE deals SET hot_score = calculate_hot_score(upvote_count, downvote_count, created_at)
    WHERE id = NEW.deal_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vote_update_hot_score
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_deal_hot_score();

-- ============================================
-- 8. STORAGE bucket for deal images
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('deal-images', 'deal-images', true);

CREATE POLICY "Anyone can view deal images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'deal-images');

CREATE POLICY "Authenticated users can upload deal images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'deal-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own deal images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'deal-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 3.3 Enable Google OAuth

1. Supabase Dashboard → Authentication → Providers → Google
2. Enable Google provider
3. Add Google Client ID and Secret (from Google Cloud Console)
4. Set redirect URL: `http://localhost:3000/auth/callback` (dev) + production URL later

### 3.4 Generate TypeScript Types

```bash
npx supabase gen types --lang=typescript --project-id your-project-id > lib/supabase/types.ts
```

---

## 4. Supabase Client Helpers

### 4.1 `lib/supabase/client.ts` — Browser Client

```typescript
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### 4.2 `lib/supabase/server.ts` — Server Client

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — ignore.
          }
        },
      },
    }
  );
}
```

### 4.3 `middleware.ts` — Auth Session Refresh

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

---

## 5. Auth Implementation

### 5.1 Auth Callback Route — `app/auth/callback/route.ts`

```typescript
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
```

### 5.2 Auth Server Actions — `lib/actions/auth.ts`

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) throw error;
  if (data.url) redirect(data.url);
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  redirect("/");
}

export async function signUp(email: string, password: string) {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) throw error;
  // User will receive confirmation email
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
```

### 5.3 Auth Components

**`components/auth/AuthButton.tsx`** — Shows sign-in or user avatar dropdown. Client Component.
**`components/auth/LoginForm.tsx`** — Email/password form. Client Component.
**`components/auth/OAuthButton.tsx`** — Google sign-in button. Client Component.

---

## 6. Root Layout Shell

### 6.1 `app/layout.tsx`

- Import Geist fonts (already there)
- Wrap children in a Toaster provider (shadcn toast)
- Render `<Header />` and `<MobileNav />`
- Clean semantic HTML: `<header>`, `<main>`, `<nav>`

### 6.2 `components/layout/Header.tsx` (Client Component)

- Logo (text-based for now — "UAE Bargains")
- Desktop: sort tabs placeholder + category links + "Post Deal" button + AuthButton
- Mobile: logo + "Post Deal" + AuthButton (categories move to CategoryBar below)
- Sticky top, white background, subtle bottom border

### 6.3 `components/layout/MobileNav.tsx` (Client Component)

- Fixed bottom bar, visible only on mobile (`md:hidden`)
- 4 items: Home, Categories (sheet), Post Deal, Profile
- Active state based on current pathname
- `pb-safe` for iPhone safe area

### 6.4 `components/layout/CategoryBar.tsx` (Server Component)

- Horizontal scrollable row of category pills
- Fetches categories from Supabase
- "All" pill + one per category
- Links to `/category/[slug]`

---

## 7. Shared Utilities

### 7.1 `lib/utils.ts`

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return `AED ${amount.toFixed(2)}`;
}

export function formatPriceShort(amount: number): string {
  return `AED ${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
}
```

### 7.2 `lib/constants.ts`

```typescript
export const SORT_OPTIONS = ["hot", "new", "top"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const DEALS_PER_PAGE = 20;
```

---

## 8. `next.config.ts` Update

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
```

---

## 9. Design Decisions for UI Revamp-Friendliness

Since the UI will be heavily revamped later:

- **Keep layout components thin.** Header, MobileNav, CategoryBar should be pure presentation — no business logic embedded.
- **All data fetching happens in page-level Server Components or Server Actions**, not inside layout components.
- **Use shadcn/ui primitives as-is** — don't customize them heavily now. They're designed to be reskinned via CSS variables.
- **All colors/spacing come from Tailwind theme tokens** — no hardcoded hex values.
- **Component props should be data-driven** — pass data as props, don't couple components to Supabase queries.

---

## Test Cases

### T1.1 — Environment & Dependencies
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Dev server starts | Run `npm run dev` | App loads at localhost:3000 without errors |
| 2 | TypeScript compiles | Run `npm run build` | No type errors |
| 3 | Supabase types generated | Check `lib/supabase/types.ts` exists | File contains Database type with all tables |

### T1.2 — Database Schema
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Tables exist | Run `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'` in Supabase SQL Editor | profiles, categories, deals, comments, votes all present |
| 2 | Categories seeded | `SELECT * FROM categories ORDER BY sort_order` | 5 rows: electronics, dining, fashion, groceries, travel |
| 3 | RLS enabled | Check each table's RLS status in Supabase Dashboard | All 5 tables have RLS enabled |
| 4 | Profile auto-creation | Create a user via Supabase Auth → check profiles table | New row with matching id, derived username |

### T1.3 — Authentication
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Google sign-in | Click "Sign in with Google" | Redirects to Google → returns to app → user is logged in |
| 2 | Email sign-up | Enter email + password on sign-up form | Confirmation email sent. After confirming, user is logged in |
| 3 | Email sign-in | Enter existing credentials on login form | User is logged in, redirected to homepage |
| 4 | Sign out | Click sign out in user dropdown | Session cleared, redirected to homepage, auth button shows "Sign in" |
| 5 | Session persistence | Sign in → close tab → reopen | User is still logged in (cookie-based session) |
| 6 | Protected route redirect | Navigate to `/deals/new` while logged out | Redirected to `/login` |
| 7 | Auth callback error | Navigate to `/auth/callback` without a code | Redirected to `/login?error=auth_failed` |
| 8 | Profile created on signup | Sign up with Google or email | Row exists in `profiles` table with correct username and avatar |

### T1.4 — Layout
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Header renders | Load any page | Header visible with logo, nav, auth button |
| 2 | Mobile nav visible | Resize to <768px | Bottom nav bar appears with 4 items |
| 3 | Mobile nav hidden on desktop | Resize to >768px | Bottom nav bar is hidden |
| 4 | Category bar loads | Load homepage | Horizontal category pills visible, "All" + 5 categories |
| 5 | Category links work | Click "Electronics" pill | Navigates to `/category/electronics` |
| 6 | Sticky header | Scroll down on any page | Header stays pinned to top |

### T1.5 — Supabase Client
| # | Test | Steps | Expected |
|---|------|-------|----------|
| 1 | Server client works | Load any page that fetches data | No errors in server console |
| 2 | Browser client works | Trigger any client-side Supabase call (e.g., sign in) | No errors in browser console |
| 3 | Middleware refreshes session | Check network tab for Supabase cookie updates on page load | Auth cookies are refreshed |
