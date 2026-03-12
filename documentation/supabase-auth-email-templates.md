# Supabase Auth Email Templates (HalaSaves)

This repo now includes branded templates for the three auth emails used by the app:

- Confirm signup
- Magic link sign-in
- Password recovery

Templates live in:

- `supabase/templates/auth/confirmation.html`
- `supabase/templates/auth/magic-link.html`
- `supabase/templates/auth/recovery.html`

## Why This Design

The templates were kept intentionally minimal while applying current transactional-email best practices:

- Single-column layout with inline CSS for broad client compatibility.
- Clear hierarchy and one primary CTA per email.
- Mobile-friendly spacing and readable body copy.
- Preheader text for better inbox context.
- OTP fallback (`{{ .Token }}`) plus raw-link fallback.
- Security-oriented copy (ignore guidance if action was not requested).
- Consistent HalaSaves branding cues (name + palette) without adding marketing noise.

Reference docs used:

- Supabase Auth Email Templates: https://supabase.com/docs/guides/auth/auth-email-templates
- Mailgun transactional email best practices: https://www.mailgun.com/blog/email/transactional-html-email-templates/
- Litmus dark mode/accessibility guidance: https://www.litmus.com/blog/the-ultimate-guide-to-dark-mode-for-email-marketers

## Applying Templates To Supabase

You can push these templates directly with the script:

```bash
node scripts/update-supabase-auth-email-templates.mjs
```

The command above is a dry run. It validates and previews template loading.

To apply for real:

```bash
SUPABASE_ACCESS_TOKEN="..." SUPABASE_PROJECT_REF="..." node scripts/update-supabase-auth-email-templates.mjs --apply
```

Notes:

- `SUPABASE_ACCESS_TOKEN` is from Supabase Dashboard -> Account -> Access Tokens.
- `SUPABASE_PROJECT_REF` is your project reference ID.
- The script updates only the three template fields and subjects listed above.

## Manual Dashboard Fallback

If you prefer manual edits:

1. Open Supabase Dashboard -> Authentication -> Email Templates.
2. Update Confirm signup, Magic link, and Reset password.
3. Paste HTML from the corresponding files in `supabase/templates/auth/`.
4. Save each template and run a real sign-up/magic-link/reset flow to verify render + behavior.
