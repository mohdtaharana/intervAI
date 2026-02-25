import { Hono } from 'hono'
import { verifyToken } from './auth'
import { generateQuestions, generateAdaptiveQuestion, analyzeAnswer, generateOverallFeedback } from '../ai-engine'

import type { D1Database } from '@cloudflare/workers-types'

type Bindings = {
  DB: D1Database
  OPENAI_API_KEY: string
  OPENAI_BASE_URL: string
  JWT_SECRET: string
}

export const interviewRoutes = new Hono<{ Bindings: Bindings }>()

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`
}

function sanitizeQuestionType(type: string): string {
  const allowed = ['technical', 'behavioral', 'hr', 'situational', 'project'];
  const t = type?.toLowerCase().trim();
  if (allowed.includes(t)) return t;
  return 'technical'; // Default fallback to satisfy constraint
}

async function getUser(c: any): Promise<any> {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) throw new Error('Unauthorized')
  return verifyToken(authHeader.split(' ')[1], c.env.JWT_SECRET)
}

// Start a new interview
interviewRoutes.post('/start', async (c) => {
  try {
    const user = await getUser(c)
    const { resumeId, type = 'technical', language = 'en' } = await c.req.json()

    let resumeData = null
    if (resumeId) {
      const resume = await c.env.DB.prepare(
        'SELECT parsed_data FROM resumes WHERE id = ? AND user_id = ?'
      ).bind(resumeId, user.id).first<any>()
      if (resume?.parsed_data) {
        resumeData = JSON.parse(resume.parsed_data)
      }
    }

    const interviewId = generateId('int')
    await c.env.DB.prepare(
      'INSERT INTO interviews (id, user_id, resume_id, type, status, language) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(interviewId, user.id, resumeId || null, type, 'in_progress', language).run()

    // Generate first question
    const questions = await generateQuestions(
      resumeData, type, language, 1,
      c.env.OPENAI_API_KEY, c.env.OPENAI_BASE_URL
    )

    if (questions.length > 0) {
      const qId = generateId('q')
      const sanitizedType = sanitizeQuestionType(questions[0].type);
      await c.env.DB.prepare(
        'INSERT INTO interview_questions (id, interview_id, question_text, question_type, difficulty, order_num) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(qId, interviewId, questions[0].text, sanitizedType, questions[0].difficulty, 1).run()

      return c.json({
        success: true,
        interview: { id: interviewId, type, status: 'in_progress' },
        currentQuestion: {
          id: qId,
          text: questions[0].text,
          type: questions[0].type,
          difficulty: questions[0].difficulty,
          questionNumber: 1
        }
      })
    }

    return c.json({ success: true, interview: { id: interviewId, type, status: 'in_progress' } })
  } catch (err: any) {
    return c.json({ error: err.message }, err.message === 'Unauthorized' ? 401 : 500)
  }
})

// Submit answer and get next question
interviewRoutes.post('/:id/answer', async (c) => {
  try {
    const user = await getUser(c)
    const interviewId = c.req.param('id')
    const { questionId, answerText, isSkip } = await c.req.json()

    const interview = await c.env.DB.prepare(
      'SELECT * FROM interviews WHERE id = ? AND user_id = ? AND status = ?'
    ).bind(interviewId, user.id, 'in_progress').first<any>()

    if (!interview) {
      return c.json({ error: 'Interview not found or already completed' }, 404)
    }

    const question = await c.env.DB.prepare(
      'SELECT * FROM interview_questions WHERE id = ? AND interview_id = ?'
    ).bind(questionId, interviewId).first<any>()

    if (!question) {
      return c.json({ error: 'Question not found' }, 404)
    }

    // Skip analysis if explicitly skipped or answer is trivial
    let analysis = {
      score: 0, feedback: 'Skipped.',
      communication: 0, technical: 0, confidence: 0, clarity: 0
    }

    if (!isSkip && answerText && answerText.trim().length > 3) {
      analysis = await analyzeAnswer(
        question.question_text, answerText, question.question_type,
        c.env.OPENAI_API_KEY, c.env.OPENAI_BASE_URL
      )
    } else if (isSkip) {
      analysis.feedback = "Question skipped by user."
    }

    // Update question with scores
    await c.env.DB.prepare(`
      UPDATE interview_questions SET 
        answer_text = ?, score = ?, feedback = ?,
        communication_score = ?, technical_score = ?,
        confidence_score = ?, clarity_score = ?,
        answered_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      answerText || (isSkip ? '[Skipped]' : ''), analysis.score, analysis.feedback,
      analysis.communication, analysis.technical,
      analysis.confidence, analysis.clarity,
      questionId
    ).run()

    const qCount = await c.env.DB.prepare(
      'SELECT COUNT(*) as cnt FROM interview_questions WHERE interview_id = ?'
    ).bind(interviewId).first<any>()

    const currentNum = qCount?.cnt || 0
    const maxQuestions = 8

    if (currentNum >= maxQuestions) {
      return await completeInterview(c, interviewId, user.id)
    }

    // Generate next question
    let resumeData = null
    if (interview.resume_id) {
      const resume = await c.env.DB.prepare(
        'SELECT parsed_data FROM resumes WHERE id = ?'
      ).bind(interview.resume_id).first<any>()
      if (resume?.parsed_data) resumeData = JSON.parse(resume.parsed_data)
    }

    const prevQA = await c.env.DB.prepare(
      'SELECT question_text, answer_text FROM interview_questions WHERE interview_id = ? ORDER BY order_num'
    ).bind(interviewId).all()

    const nextQuestions = await generateAdaptiveQuestion(
      resumeData, interview.type, interview.language,
      prevQA.results, analysis,
      c.env.OPENAI_API_KEY, c.env.OPENAI_BASE_URL
    )

    if (nextQuestions.length > 0) {
      const nqId = generateId('q')
      const sanitizedType = sanitizeQuestionType(nextQuestions[0].type);
      await c.env.DB.prepare(
        'INSERT INTO interview_questions (id, interview_id, question_text, question_type, difficulty, order_num) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(nqId, interviewId, nextQuestions[0].text, sanitizedType, nextQuestions[0].difficulty, currentNum + 1).run()

      return c.json({
        success: true,
        analysis: {
          score: analysis.score,
          feedback: analysis.feedback,
          communication: analysis.communication,
          technical: analysis.technical,
          confidence: analysis.confidence,
          clarity: analysis.clarity
        },
        nextQuestion: {
          id: nqId,
          text: nextQuestions[0].text,
          type: nextQuestions[0].type,
          difficulty: nextQuestions[0].difficulty,
          questionNumber: currentNum + 1
        },
        progress: { current: currentNum + 1, total: maxQuestions }
      })
    }

    return await completeInterview(c, interviewId, user.id)
  } catch (err: any) {
    return c.json({ error: err.message }, err.message === 'Unauthorized' ? 401 : 500)
  }
})

// Delete an interview
interviewRoutes.delete('/:id', async (c) => {
  try {
    const user = await getUser(c)
    const id = c.req.param('id')

    // Verify ownership
    const interview = await c.env.DB.prepare(
      'SELECT id FROM interviews WHERE id = ? AND user_id = ?'
    ).bind(id, user.id).first<any>()

    if (!interview) return c.json({ error: 'Interview not found' }, 404)

    // Delete associated questions first
    await c.env.DB.prepare(
      'DELETE FROM interview_questions WHERE interview_id = ?'
    ).bind(id).run()

    // Delete the interview
    await c.env.DB.prepare(
      'DELETE FROM interviews WHERE id = ? AND user_id = ?'
    ).bind(id, user.id).run()

    return c.json({ success: true, message: 'Interview deleted' })
  } catch (err: any) {
    return c.json({ error: err.message }, err.message === 'Unauthorized' ? 401 : 500)
  }
})

// Finish interview early
interviewRoutes.post('/:id/finish', async (c) => {
  try {
    const user = await getUser(c)
    const id = c.req.param('id')

    const interview = await c.env.DB.prepare(
      'SELECT id, status FROM interviews WHERE id = ? AND user_id = ?'
    ).bind(id, user.id).first<any>()

    if (!interview) return c.json({ error: 'Interview not found' }, 404)
    if (interview.status === 'completed') return c.json({ success: true, message: 'Already completed' })

    return await completeInterview(c, id, user.id)
  } catch (err: any) {
    return c.json({ error: err.message }, 500)
  }
})

// Get interview details
interviewRoutes.get('/:id', async (c) => {
  try {
    const user = await getUser(c)
    const id = c.req.param('id')

    const interview = await c.env.DB.prepare(
      'SELECT * FROM interviews WHERE id = ? AND user_id = ?'
    ).bind(id, user.id).first<any>()

    if (!interview) return c.json({ error: 'Interview not found' }, 404)

    const questions = await c.env.DB.prepare(
      'SELECT * FROM interview_questions WHERE interview_id = ? ORDER BY order_num'
    ).bind(id).all()

    return c.json({
      interview: {
        ...interview,
        strengths: interview.strengths ? JSON.parse(interview.strengths) : [],
        weaknesses: interview.weaknesses ? JSON.parse(interview.weaknesses) : [],
        improvements: interview.improvements ? JSON.parse(interview.improvements) : [],
        skill_gaps: interview.skill_gaps ? JSON.parse(interview.skill_gaps) : [],
        learning_roadmap: interview.learning_roadmap ? JSON.parse(interview.learning_roadmap) : []
      },
      questions: questions.results
    })
  } catch (err: any) {
    return c.json({ error: err.message }, 401)
  }
})

// List all interviews
interviewRoutes.get('/', async (c) => {
  try {
    const user = await getUser(c)
    const interviews = await c.env.DB.prepare(
      'SELECT * FROM interviews WHERE user_id = ? ORDER BY started_at DESC'
    ).bind(user.id).all()

    const results = interviews.results.map((i: any) => ({
      ...i,
      strengths: i.strengths ? JSON.parse(i.strengths) : [],
      weaknesses: i.weaknesses ? JSON.parse(i.weaknesses) : [],
      improvements: i.improvements ? JSON.parse(i.improvements) : [],
      skill_gaps: i.skill_gaps ? JSON.parse(i.skill_gaps) : [],
      learning_roadmap: i.learning_roadmap ? JSON.parse(i.learning_roadmap) : []
    }))

    return c.json({ interviews: results })
  } catch (err: any) {
    return c.json({ error: err.message }, 401)
  }
})

// Complete interview helper
async function completeInterview(c: any, interviewId: string, userId: string) {
  const questions = await c.env.DB.prepare(
    'SELECT * FROM interview_questions WHERE interview_id = ? ORDER BY order_num'
  ).bind(interviewId).all()

  const answered = questions.results.filter((q: any) => q.answer_text && q.answer_text !== '[Skipped]')
  const totalAsked = questions.results.length || 1

  const avgScores = {
    total: answered.reduce((s: number, q: any) => s + (q.score || 0), 0) / totalAsked,
    communication: answered.reduce((s: number, q: any) => s + (q.communication_score || 0), 0) / totalAsked,
    technical: answered.reduce((s: number, q: any) => s + (q.technical_score || 0), 0) / totalAsked,
    confidence: answered.reduce((s: number, q: any) => s + (q.confidence_score || 0), 0) / totalAsked,
    clarity: answered.reduce((s: number, q: any) => s + (q.clarity_score || 0), 0) / totalAsked,
  }

  const overallFeedback = await generateOverallFeedback(
    questions.results, avgScores,
    c.env.OPENAI_API_KEY, c.env.OPENAI_BASE_URL
  )

  await c.env.DB.prepare(`
    UPDATE interviews SET 
      status = ?,
      total_score = ?, communication_score = ?,
      technical_score = ?, confidence_score = ?,
      clarity_score = ?, overall_feedback = ?,
      strengths = ?, weaknesses = ?, improvements = ?,
      skill_gaps = ?, learning_roadmap = ?,
      completed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(
    'completed', Math.round(avgScores.total * 10) / 10,
    Math.round(avgScores.communication * 10) / 10,
    Math.round(avgScores.technical * 10) / 10,
    Math.round(avgScores.confidence * 10) / 10,
    Math.round(avgScores.clarity * 10) / 10,
    overallFeedback.feedback,
    JSON.stringify(overallFeedback.strengths),
    JSON.stringify(overallFeedback.weaknesses),
    JSON.stringify(overallFeedback.improvements),
    JSON.stringify(overallFeedback.skill_gaps),
    JSON.stringify(overallFeedback.learning_roadmap),
    interviewId
  ).run()

  return c.json({
    success: true,
    completed: true,
    scores: avgScores,
    feedback: overallFeedback,
    questions: questions.results
  })
}
