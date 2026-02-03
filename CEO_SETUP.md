# CEO Access Setup

Only users with **role = 'CEO'** in the `employees` table can access the internal app (dashboard, clients, settings, etc.). Clients still sign in and use the client portal only.

## CEO user: Junaid

- **Login email:** `junaid@amzdudes.com`
- **Temporary password:** `admin123` (must be changed after first login via **Settings → Security**)

## 1. Apply the migration

Ensure the CEO employee row exists:

```bash
# If using Supabase CLI
supabase db push

# Or run the migration SQL in Supabase Dashboard → SQL Editor:
# supabase/migrations/20260127120000_ceo_junaid.sql
```

That inserts/updates an employee with `name = 'Junaid'`, `email = 'junaid@amzdudes.com'`, `role = 'CEO'`.

## 2. Create auth user and link (one-time)

From the **repo root**, using credentials from `backend/.env`:

```bash
node --env-file=backend/.env scripts/create-ceo-user.mjs
```

Or set env manually:

```bash
SUPABASE_URL=https://your-project.supabase.co SUPABASE_SERVICE_ROLE_KEY=your-service-role-key node scripts/create-ceo-user.mjs
```

This creates the Supabase Auth user with the temporary password and sets `employees.auth_user_id` for the CEO row.

## 3. First login

1. Open the app and choose **Employee** on the login screen.
2. Sign in with `junaid@amzdudes.com` / `admin123`.
3. Go to **Settings → Security** and change the password.

## Notes

- Non-CEO employees who sign in are redirected to the login page with a “Access restricted to CEO” message and are signed out.
- Clients are unchanged: they sign in as **Client** and only see the client portal.
