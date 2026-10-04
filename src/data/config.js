/**
 * Backend configuration.
 *
 * Leave both values empty to run in local mode (everything is saved in the
 * visitor's own browser). To share likes, comments, places and taste results
 * between all visitors, create a Supabase project, run supabase/schema.sql in
 * its SQL editor, then paste the project URL and the public "anon" key here.
 * The anon key is designed to be public; row-level security protects the data.
 */
export const SUPABASE_URL = ''; // e.g. 'https://abcdefgh.supabase.co'
export const SUPABASE_ANON_KEY = '';
