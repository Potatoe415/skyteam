// Browser Supabase client (anon key only). Used for anonymous auth + realtime
// subscriptions. The secret service_role key never reaches the browser.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let client: SupabaseClient | null = null

// Lazily create the browser client. Done on first use (not at import time) so a
// missing env var never white-screens the whole app — only online play fails,
// with a clear message. Home and local pass-and-play keep working.
export function getSupabase(): SupabaseClient {
  if (client) return client
  if (!url || !anonKey) {
    throw new Error(
      'Online play is not configured: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    )
  }
  client = createClient(url, anonKey)
  return client
}

// Ensure an anonymous session exists and return its access token (used as the
// Bearer token for server actions).
export async function ensureSignedIn(): Promise<string> {
  const supabase = getSupabase()
  const { data } = await supabase.auth.getSession()
  if (data.session) return data.session.access_token
  const { data: signed, error } = await supabase.auth.signInAnonymously()
  if (error || !signed.session) {
    throw new Error('Anonymous sign-in failed. Check Supabase auth settings.')
  }
  return signed.session.access_token
}
