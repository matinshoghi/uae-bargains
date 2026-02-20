# 04 — Footer & Static Pages

**Date:** 2026-02-21

## Summary

Added a clean, minimal footer component and four new pages: About Us, Terms of Use, Privacy Policy, and Contact Us. The Contact Us page includes a form backed by a new `contact_submissions` Supabase table. Content is adapted from OzBargain and tailored for the UAE market.

## Files Created

| File | Description |
|------|-------------|
| `components/layout/Footer.tsx` | Footer with nav links, social icons, merchant disclaimer, copyright |
| `components/layout/ProseLayout.tsx` | Shared wrapper for prose content pages (title, separator, content) |
| `app/about/page.tsx` | About Us — community intro, 4-step how-it-works, guidelines, merchant info |
| `app/terms/page.tsx` | Terms of Use — 7 sections, refs UAE Cybercrime Law |
| `app/privacy/page.tsx` | Privacy Policy — 7 sections, refs Supabase/Vercel as data processors |
| `app/contact/page.tsx` | Contact Us page with merchant disclaimer and form |
| `components/contact/ContactForm.tsx` | Client-side contact form with validation and toast |
| `lib/validations/contact.ts` | Zod schema for contact form (name, email, category, message) |
| `lib/actions/contact.ts` | Server action — validates and inserts into `contact_submissions` |

## Files Modified

| File | Change |
|------|--------|
| `app/layout.tsx` | Added `<Footer />` between `</main>` and `<MobileNav />` |
| `lib/supabase/types.ts` | Added `contact_submissions` table type |

## Design Decisions

- **Footer visibility:** `hidden md:block` — hidden on mobile where MobileNav occupies the bottom; visible on desktop
- **ProseLayout width:** `max-w-3xl` for comfortable reading line lengths (narrower than main's `max-w-5xl`)
- **Contact form pattern:** Follows existing `DealForm` / `SettingsForm` pattern — `useActionState`, hidden input for Select, inline field errors, sonner toast on success
- **No auth required for contact form:** Accessible to both authenticated and anonymous users
- **Form reset:** Uses React `key` prop pattern to remount form on successful submission

## Database SQL

Run in the Supabase SQL editor:

```sql
create table public.contact_submissions (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  category text not null,
  message text not null,
  status text not null default 'new',
  created_at timestamptz default now() not null
);

alter table public.contact_submissions enable row level security;

create policy "Anyone can submit contact form"
  on public.contact_submissions
  for insert
  to anon, authenticated
  with check (true);
```

## Contact Form Categories

- Support
- Deal Related
- General Enquiry
