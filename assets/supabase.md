# Supabase Integration for `todo_app`

## Project
- **Supabase Project URL:** https://tdfmyfdpvnuseomlevun.supabase.co
- **Project Name:** todo_app

## Authentication
- **Auth Method:** Email and password (social providers disabled)
- **User Table:** Standard Supabase `auth.users`
- **Todos Table Auth Mapping:** Each todo row is associated with a user via the `user_id` foreign key.

## Database Table: `todos`

| Column      | Type      | Nullable | Default            | Notes/Constraints                                      |
|-------------|-----------|----------|--------------------|--------------------------------------------------------|
| id          | uuid      | NO       | gen_random_uuid()  | Primary Key                                            |
| user_id     | uuid      | NO       |                    | Foreign Key → `auth.users.id`                          |
| title       | text      | NO       |                    |                                                        |
| completed   | boolean   | NO       | FALSE              | Track completion status                                |
| created_at  | timestamp | NO       | now()              |                                                        |

### Foreign Key Constraint
- `user_id` references the user's `id` in the standard Supabase `auth.users` table.

## Setup Steps Performed

1. Connected to Supabase project using provided credentials.
2. Enabled email/password authentication.
3. Created `todos` table (schema above).
4. Added a foreign key on `todos.user_id` referencing `auth.users.id`.

---

## Client Integration
- Use the Supabase JS client for authentication (sign up, sign in, sign out) and querying the `todos` table.
- Filter todos for the authenticated user by using `user_id`.

> ⚠️ **Keep the Supabase API keys secure and do not expose the service_role key in frontend code!**

---

_Last updated: [Automated Script]_
