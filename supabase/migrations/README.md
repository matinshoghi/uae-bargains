# Migrations

Migrations run in filename order. Use this naming convention:

```
{sequence}_{timestamp}_{description}.sql
```

- **sequence** — Zero-padded number (01, 02, 03, …) for execution order.
- **timestamp** — `YYYYMMDDHHMMSS` when the migration was created.
- **description** — Short snake_case description.

**Example:** `03_20260223140000_add_deal_categories.sql`

Run in order: 01 → 02 → 03. Timestamp is for reference only; sequence controls order.
