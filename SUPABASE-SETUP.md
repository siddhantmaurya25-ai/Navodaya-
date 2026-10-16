# Supabase setup

This app uses Supabase Auth with email/password login and a single account-owned progress snapshot. The Android build bundles the web app locally; Supabase is used only for authentication and cloud saves.

The client receives the project URL and **publishable key** from `.grok/app-env.json`. This key is designed to be public in browser/mobile apps. Do not place a `service_role` key, database password, or other server secret in the source or APK. The `navodaya_progress` table is protected by row-level security and grants only select, insert, and update to authenticated users. Every row is bound to `auth.uid()`.

The migration lives at `supabase/migrations/202610160001_navodaya_progress.sql`. The `npm run build` migration runner is intentionally separate and only reads the top-level `migrations/` directory, so this Supabase migration must be applied to the Navodaya Supabase project, not to the app's Neon/PGLite stack.

In Supabase Dashboard, open **Authentication → URL Configuration → Redirect URLs** and add `com.navodaya.vijeta://auth/callback`. This is required for confirmation emails to reopen the Android app. For a web deployment, also allow-list its exact origin with a trailing `/`. The APK registers the Android intent filter and exchanges the returned auth code/token for a session. Email confirmation may be required after sign-up; offline progress remains on-device until the account is verified and signed in. After sign-in, local and cloud progress is merged and synchronized with optimistic version checks.

The APK workflow produces a debug APK for testing, not a Play Store-signed release.
