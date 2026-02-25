import { Hono } from 'hono'
import { verifyToken } from './auth'
import { parseResume } from '../ai-engine'

import type { D1Database } from '@cloudflare/workers-types'

type Bindings = {
  DB: D1Database
  OPENAI_API_KEY: string
  OPENAI_BASE_URL: string
  JWT_SECRET: string
}

export const resumeRoutes = new Hono<{ Bindings: Bindings }>()

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
}

async function getUser(c: any): Promise<any> {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) throw new Error('Unauthorized')
  return verifyToken(authHeader.split(' ')[1], c.env.JWT_SECRET)
}

// Upload and parse resume
resumeRoutes.post('/upload', async (c) => {
  try {
    const user = await getUser(c)
    const body = await c.req.json()
    const { text, filename } = body

    if (!text || !filename) {
      return c.json({ error: 'Resume text and filename are required' }, 400)
    }

    const parsedData = await parseResume(text, c.env.OPENAI_API_KEY, c.env.OPENAI_BASE_URL)

    const id = generateId('res')
    await c.env.DB.prepare(
      'INSERT INTO resumes (id, user_id, filename, raw_text, parsed_data) VALUES (?, ?, ?, ?, ?)'
    ).bind(id, user.id, filename, text, JSON.stringify(parsedData)).run()

    return c.json({
      success: true,
      resume: { id, filename, parsed_data: parsedData }
    })
  } catch (err: any) {
    return c.json({ error: err.message }, err.message === 'Unauthorized' ? 401 : 500)
  }
})

// Get user's resumes
resumeRoutes.get('/', async (c) => {
  try {
    const user = await getUser(c)
    const resumes = await c.env.DB.prepare(
      'SELECT id, filename, parsed_data, uploaded_at FROM resumes WHERE user_id = ? ORDER BY uploaded_at DESC'
    ).bind(user.id).all()

    const results = resumes.results.map((r: any) => ({
      ...r,
      parsed_data: r.parsed_data ? JSON.parse(r.parsed_data) : null
    }))

    return c.json({ resumes: results })
  } catch (err: any) {
    return c.json({ error: err.message }, 401)
  }
})

// Get single resume
resumeRoutes.get('/:id', async (c) => {
  try {
    const user = await getUser(c)
    const id = c.req.param('id')

    const resume = await c.env.DB.prepare(
      'SELECT * FROM resumes WHERE id = ? AND user_id = ?'
    ).bind(id, user.id).first<any>()

    if (!resume) return c.json({ error: 'Resume not found' }, 404)

    return c.json({
      resume: {
        ...resume,
        parsed_data: resume.parsed_data ? JSON.parse(resume.parsed_data) : null
      }
    })
  } catch (err: any) {
    return c.json({ error: err.message }, 401)
  }
})

// Delete resume
resumeRoutes.delete('/:id', async (c) => {
  try {
    const user = await getUser(c)
    const id = c.req.param('id')

    await c.env.DB.prepare(
      'DELETE FROM resumes WHERE id = ? AND user_id = ?'
    ).bind(id, user.id).run()

    return c.json({ success: true })
  } catch (err: any) {
    return c.json({ error: err.message }, 401)
  }
})
