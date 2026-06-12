// Resolve the calling user from the Supabase access token (anonymous sign-in).
// We trust the seat<->user mapping in game_players, so every move must be tied
// to a verified user id, not a client-supplied value.

import type { VercelRequest } from '@vercel/node'
import { getServiceClient } from './supabase'

export function bearerToken(req: VercelRequest): string | null {
  const header = req.headers.authorization ?? ''
  const match = header.match(/^Bearer (.+)$/i)
  return match ? match[1] : null
}

export async function requireUserId(req: VercelRequest): Promise<string> {
  const token = bearerToken(req)
  if (!token) throw new HttpError(401, 'Missing access token')
  const { data, error } = await getServiceClient().auth.getUser(token)
  if (error || !data.user) throw new HttpError(401, 'Invalid access token')
  return data.user.id
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}
