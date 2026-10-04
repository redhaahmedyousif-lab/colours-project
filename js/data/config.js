/**
 * Backend configuration (public, safe to commit).
 *
 * Only the project URL and the PUBLISHABLE key belong here. Both are designed
 * to be public: row-level security and the functions in supabase/schema.sql
 * decide what visitors can do.
 *
 * NEVER put the secret / service_role key (sb_secret_…) in this file or
 * anywhere in the website. It bypasses all security rules. Keep it only in
 * the Supabase dashboard or a private server.
 *
 * Leave both values empty to run in local mode (data stays in each browser).
 */
export const SUPABASE_URL = 'https://qndtqhjtuqerdcayebry.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_YYYPWKUTNndTXYulYnjssA_decQRKOx';
