import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// If the env vars are missing (e.g. local dev without .env.local), the app
// still works fully offline — cloud sync just silently no-ops.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
