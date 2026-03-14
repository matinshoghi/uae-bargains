# CLAUDE.md - Project Instructions for AI Assistants

## Database Safety Rules (CRITICAL)

- NEVER run SQL statements directly against the database
- NEVER use `supabase db reset`, `supabase db push`, or any destructive Supabase CLI commands
- NEVER create or run migration files
- NEVER seed, truncate, drop, or alter tables via code or CLI
- When database schema changes are needed:
  1. Write the SQL statement
  2. Present it to the developer for review
  3. The developer will run it manually in the Supabase Dashboard SQL Editor
- NEVER modify `.env.local` or any environment files
- NEVER expose or log secret keys, tokens, or credentials

## Admin Client Safety

- `createAdminClient()` bypasses Row Level Security — only use behind `requireAdmin()` guard
- The only exceptions are cron API routes (protected by `CRON_SECRET` bearer token) and the coupon click tracking RPC (public by design)
- Never pass unsanitized user input into admin client queries

## Security Conventions

- All form inputs must be validated with Zod schemas (see `lib/validations/`)
- All server actions must check authentication via `supabase.auth.getUser()`
- All admin actions must call `requireAdmin()` before any operations
- File uploads must validate MIME type AND file size before uploading
- External URLs must be validated before storing or redirecting
- Rate limiting must be applied to user-facing submission endpoints

## Code Conventions

- Use `sonner` for toast notifications (shadcn/ui toast is deprecated)
- Supabase clients: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server), `lib/supabase/admin.ts` (service role)
- Next.js 16 uses `proxy.ts` instead of `middleware.ts`
- TypeScript strict mode is enabled
