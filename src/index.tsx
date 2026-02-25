import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authRoutes } from './routes/auth'
import { interviewRoutes } from './routes/interview'
import { resumeRoutes } from './routes/resume'
import { dashboardRoutes } from './routes/dashboard'
import { aiRoutes } from './routes/ai'
import { adminRoutes } from './routes/admin'
import { renderApp } from './frontend'

import type { D1Database } from '@cloudflare/workers-types'

type Bindings = {
  DB: D1Database
  OPENAI_API_KEY: string
  OPENAI_BASE_URL: string
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS
app.use('/api/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// API Routes
app.route('/api/auth', authRoutes)
app.route('/api/interviews', interviewRoutes)
app.route('/api/resumes', resumeRoutes)
app.route('/api/dashboard', dashboardRoutes)
app.route('/api/ai', aiRoutes)
app.route('/api/admin', adminRoutes)

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

// Serve the SPA for all non-API routes
app.get('*', (c) => {
  return c.html(renderApp())
})

export default app
