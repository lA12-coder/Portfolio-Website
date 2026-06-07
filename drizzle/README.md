This project now uses Supabase Postgres through Drizzle.

Use the Supabase pooled connection string in `DATABASE_URL`, then run:

```bash
rtk pnpm run db:push
```

`drizzle-kit push` syncs the schema directly to Supabase, so generated MySQL migration files are no longer used.
