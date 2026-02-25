import { Hono } from 'hono'
import type { D1Database } from '@cloudflare/workers-types'
import { verifyToken } from './auth'

type Bindings = {
    DB: D1Database
    JWT_SECRET: string
}

type Variables = {
    user: any
}

export const adminRoutes = new Hono<{ Bindings: Bindings, Variables: Variables }>()

// Admin Middleware
async function adminMiddleware(c: any, next: any) {
    const authHeader = c.req.header('Authorization')
    if (!authHeader?.startsWith('Bearer ')) return c.json({ error: 'Unauthorized' }, 401)

    const token = authHeader.split(' ')[1]
    try {
        const payload = await verifyToken(token, c.env.JWT_SECRET)
        if (payload.role !== 'admin') return c.json({ error: 'Forbidden: Admin access only' }, 403)
        c.set('user', payload)
        return await next()
    } catch (err) {
        return c.json({ error: 'Invalid token' }, 401)
    }
}

// Apply middleware to all admin routes
adminRoutes.use('*', adminMiddleware)

// Get system stats
adminRoutes.get('/stats', async (c) => {
    const users = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first<any>()
    const interviews = await c.env.DB.prepare('SELECT COUNT(*) as count FROM interviews').first<any>()
    const resumes = await c.env.DB.prepare('SELECT COUNT(*) as count FROM resumes').first<any>()

    return c.json({
        totalUsers: users.count,
        totalInterviews: interviews.count,
        totalResumes: resumes.count
    })
})

// List all users
adminRoutes.get('/users', async (c) => {
    const users = await c.env.DB.prepare('SELECT id, email, name, role, avatar_url, created_at FROM users ORDER BY created_at DESC').all()
    return c.json({ users: users.results })
})

// Delete user
adminRoutes.delete('/users/:id', async (c) => {
    const id = c.req.param('id')

    // Prevent deleting self
    const admin = c.get('user')
    if (admin.id === id) return c.json({ error: 'You cannot delete your own admin account' }, 400)

    // Super Admin Protection (Taha Rana)
    const targetUser = await c.env.DB.prepare('SELECT email FROM users WHERE id = ?').bind(id).first<any>()
    if (targetUser?.email === 'rtmea84@gmail.com') {
        return c.json({ error: 'CRITICAL: Taha Rana (Super Admin) cannot be deleted' }, 403)
    }

    // Manual batch delete to ensure reliability in deployed D1 environments
    // Child records are deleted first, then the user.
    try {
        await c.env.DB.batch([
            c.env.DB.prepare('DELETE FROM interview_questions WHERE interview_id IN (SELECT id FROM interviews WHERE user_id = ?)').bind(id),
            c.env.DB.prepare('DELETE FROM interviews WHERE user_id = ?').bind(id),
            c.env.DB.prepare('DELETE FROM resumes WHERE user_id = ?').bind(id),
            c.env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id)
        ])
        return c.json({ success: true, message: 'User and all associated data deleted' })
    } catch (err: any) {
        console.error('Delete error:', err)
        return c.json({ error: 'Database error: ' + err.message }, 500)
    }
})

// Toggle Admin Role
adminRoutes.patch('/users/:id/role', async (c) => {
    const id = c.req.param('id')
    const { role } = await c.req.json()

    if (!['user', 'admin'].includes(role)) return c.json({ error: 'Invalid role' }, 400)

    // Super Admin Protection (Taha Rana)
    const targetUser = await c.env.DB.prepare('SELECT email FROM users WHERE id = ?').bind(id).first<any>()
    if (targetUser?.email === 'rtmea84@gmail.com') {
        return c.json({ error: 'CRITICAL: Taha Rana (Super Admin) role cannot be changed' }, 403)
    }

    await c.env.DB.prepare('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .bind(role, id)
        .run()

    return c.json({ success: true, message: `User role updated to ${role}` })
})
