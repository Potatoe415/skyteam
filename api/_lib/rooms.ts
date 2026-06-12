// Room-code generation: 3 uppercase alphanumeric characters (A-Z, 0-9).

import type { SupabaseClient } from '@supabase/supabase-js'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const CODE_LENGTH = 3

export function randomRoomCode(): string {
  let code = ''
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return code
}

export function isValidRoomCode(code: string): boolean {
  return new RegExp(`^[A-Z0-9]{${CODE_LENGTH}}$`).test(code)
}

// Generate a code not already used by an active game. Retries on collision.
export async function uniqueRoomCode(supabase: SupabaseClient): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt++) {
    const code = randomRoomCode()
    const { data } = await supabase
      .from('games')
      .select('id')
      .eq('room_code', code)
      .maybeSingle()
    if (!data) return code
  }
  throw new Error('Could not allocate a unique room code')
}
