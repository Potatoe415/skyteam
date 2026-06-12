// Small wrapper that turns thrown HttpErrors into JSON responses and enforces
// POST. Keeps each endpoint focused on its own logic.

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { HttpError } from './auth'

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void>

export function postJson(fn: Handler): Handler {
  return async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' })
      return
    }
    try {
      await fn(req, res)
    } catch (err) {
      if (err instanceof HttpError) {
        res.status(err.status).json({ error: err.message })
        return
      }
      console.error(err)
      res.status(500).json({ error: 'Internal error' })
    }
  }
}

export function body<T>(req: VercelRequest): T {
  return (req.body ?? {}) as T
}
