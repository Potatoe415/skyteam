// Browser Supabase client (anon key only). Used for anonymous auth + realtime
// subscriptions. The secret service_role key never reaches the browser.

import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(url, anonKey)

// Ensure an anonymous session exists and return its access token (used as the
// Bearer token for server actions).
export async function ensureSignedIn(): Promise<string> {
  const { data } = await supabase.auth.getSession()
  if (data.session) return data.session.access_token
  const { data: signed, error } = await supabase.auth.signInAnonymously()
  if (error || !signed.session) {
    throw new Error('Anonymous sign-in failed. Check Supabase auth settings.')
  }
  return signed.session.access_token
}
