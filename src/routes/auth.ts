import { Hono } from 'hono'
import { SignJWT, jwtVerify } from 'jose'

import type { D1Database } from '@cloudflare/workers-types'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

export const authRoutes = new Hono<{ Bindings: Bindings }>()

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'ai-interviewer-salt-2024')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function createToken(payload: any, secret: string): Promise<string> {
  const secretKey = new TextEncoder().encode(secret || 'default-jwt-secret-key-2024')
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(secretKey)
}

export async function verifyToken(token: string, secret: string): Promise<any> {
  const secretKey = new TextEncoder().encode(secret || 'default-jwt-secret-key-2024')
  const { payload } = await jwtVerify(token, secretKey)
  return payload
}

// Signup
authRoutes.post('/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json()

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400)
    }

    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400)
    }

    const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
    if (existing) {
      return c.json({ error: 'Email already registered' }, 409)
    }

    const id = generateId('usr')
    const passwordHash = await hashPassword(password)

    await c.env.DB.prepare(
      'INSERT INTO users (id, email, password_hash, name, role, avatar_url) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(id, email, passwordHash, name, 'user', null).run()

    const token = await createToken({ id, email, name, role: 'user' }, c.env.JWT_SECRET)

    return c.json({
      success: true,
      user: { id, email, name, role: 'user', avatar_url: null },
      token
    })
  } catch (err: any) {
    return c.json({ error: 'Signup failed: ' + err.message }, 500)
  }
})

// Login
authRoutes.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json()

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }

    const user = await c.env.DB.prepare(
      'SELECT id, email, password_hash, name, role, avatar_url FROM users WHERE email = ?'
    ).bind(email).first<any>()

    if (!user) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }

    const passwordHash = await hashPassword(password)
    if (user.password_hash !== passwordHash) {
      return c.json({ error: 'Invalid email or password' }, 401)
    }

    const token = await createToken(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      c.env.JWT_SECRET
    )

    return c.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar_url: user.avatar_url },
      token
    })
  } catch (err: any) {
    return c.json({ error: 'Login failed: ' + err.message }, 500)
  }
})

// Get current user profile
// Update profile
authRoutes.patch('/profile', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const token = authHeader.split(' ')[1]
    const payload = await verifyToken(token, c.env.JWT_SECRET)

    const { name, email, avatar_url } = await c.req.json()
    if (!name && !email && !avatar_url) {
      return c.json({ error: 'Name, email, or avatar_url is required' }, 400)
    }

    const userId = payload.id

    await c.env.DB.prepare(`
        UPDATE users SET 
          name = COALESCE(?, name), 
          email = COALESCE(?, email), 
          avatar_url = COALESCE(?, avatar_url),
          updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).bind(name ?? null, email ?? null, avatar_url ?? null, userId).run()

    const user = await c.env.DB.prepare('SELECT id, email, name, role, avatar_url FROM users WHERE id = ?').bind(userId).first<any>()

    // Generate new token with updated name/email
    const newToken = await createToken({ id: user.id, email: user.email, name: user.name, role: user.role }, c.env.JWT_SECRET)

    return c.json({ success: true, user, token: newToken })
  } catch (err: any) {
    return c.json({ error: 'Update failed: ' + err.message }, 500)
  }
})

authRoutes.get('/me', async (c) => {
  try {
    const authHeader = c.req.header('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    const token = authHeader.split(' ')[1]
    const payload = await verifyToken(token, c.env.JWT_SECRET)

    const user = await c.env.DB.prepare(
      'SELECT id, email, name, role, avatar_url, created_at FROM users WHERE id = ?'
    ).bind(payload.id).first()

    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json({ user })
  } catch (err: any) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
})
