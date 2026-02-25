import { Hono } from 'hono'
import { verifyToken } from './auth'

import type { D1Database } from '@cloudflare/workers-types'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

export const dashboardRoutes = new Hono<{ Bindings: Bindings }>()

async function getUser(c: any): Promise<any> {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) throw new Error('Unauthorized')
  return verifyToken(authHeader.split(' ')[1], c.env.JWT_SECRET)
}

// Get dashboard stats
dashboardRoutes.get('/stats', async (c) => {
  try {
    const user = await getUser(c)

    const totalInterviews = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM interviews WHERE user_id = ?'
    ).bind(user.id).first<any>()

    const completedInterviews = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM interviews WHERE user_id = ? AND status = ?'
    ).bind(user.id, 'completed').first<any>()

    const avgScores = await c.env.DB.prepare(`
      SELECT 
        AVG(total_score) as avg_total,
        AVG(communication_score) as avg_communication,
        AVG(technical_score) as avg_technical,
        AVG(confidence_score) as avg_confidence,
        AVG(clarity_score) as avg_clarity
      FROM interviews 
      WHERE user_id = ? AND status = 'completed'
    `).bind(user.id).first<any>()

    const recentInterviews = await c.env.DB.prepare(
      'SELECT id, type, total_score, status, started_at, completed_at FROM interviews WHERE user_id = ? ORDER BY started_at DESC LIMIT 10'
    ).bind(user.id).all()

    const totalResumes = await c.env.DB.prepare(
      'SELECT COUNT(*) as count FROM resumes WHERE user_id = ?'
    ).bind(user.id).first<any>()

    // Score trends (last 10 completed interviews)
    const scoreTrends = await c.env.DB.prepare(`
      SELECT total_score, communication_score, technical_score, confidence_score, clarity_score, completed_at, type
      FROM interviews 
      WHERE user_id = ? AND status = 'completed'
      ORDER BY completed_at DESC LIMIT 10
    `).bind(user.id).all()

    // Per-type averages
    const typeStats = await c.env.DB.prepare(`
      SELECT type, COUNT(*) as count, AVG(total_score) as avg_score
      FROM interviews 
      WHERE user_id = ? AND status = 'completed'
      GROUP BY type
    `).bind(user.id).all()

    return c.json({
      stats: {
        totalInterviews: totalInterviews?.count || 0,
        completedInterviews: completedInterviews?.count || 0,
        totalResumes: totalResumes?.count || 0,
        averageScores: {
          overall: round(avgScores?.avg_total),
          communication: round(avgScores?.avg_communication),
          technical: round(avgScores?.avg_technical),
          confidence: round(avgScores?.avg_confidence),
          clarity: round(avgScores?.avg_clarity)
        }
      },
      recentInterviews: recentInterviews.results,
      scoreTrends: scoreTrends.results.reverse(),
      typeStats: typeStats.results
    })
  } catch (err: any) {
    return c.json({ error: err.message }, 401)
  }
})

// Get strengths and weaknesses analysis
dashboardRoutes.get('/analysis', async (c) => {
  try {
    const user = await getUser(c)

    const interviews = await c.env.DB.prepare(`
      SELECT strengths, weaknesses, improvements, type, total_score
      FROM interviews 
      WHERE user_id = ? AND status = 'completed'
      ORDER BY completed_at DESC LIMIT 20
    `).bind(user.id).all()

    const allStrengths: Record<string, number> = {}
    const allWeaknesses: Record<string, number> = {}
    const allImprovements: string[] = []

    interviews.results.forEach((i: any) => {
      const strengths = i.strengths ? JSON.parse(i.strengths) : []
      const weaknesses = i.weaknesses ? JSON.parse(i.weaknesses) : []
      const improvements = i.improvements ? JSON.parse(i.improvements) : []

      strengths.forEach((s: string) => {
        allStrengths[s] = (allStrengths[s] || 0) + 1
      })
      weaknesses.forEach((w: string) => {
        allWeaknesses[w] = (allWeaknesses[w] || 0) + 1
      })
      improvements.forEach((imp: string) => {
        if (!allImprovements.includes(imp)) allImprovements.push(imp)
      })
    })

    const sortedStrengths = Object.entries(allStrengths).sort((a, b) => b[1] - a[1]).slice(0, 5)
    const sortedWeaknesses = Object.entries(allWeaknesses).sort((a, b) => b[1] - a[1]).slice(0, 5)

    return c.json({
      strengths: sortedStrengths.map(([text, count]) => ({ text, count })),
      weaknesses: sortedWeaknesses.map(([text, count]) => ({ text, count })),
      improvements: allImprovements.slice(0, 10)
    })
  } catch (err: any) {
    return c.json({ error: err.message }, 401)
  }
})

function round(val: any): number {
  return val ? Math.round(val * 10) / 10 : 0
}
