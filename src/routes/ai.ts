import { Hono } from 'hono'
import { verifyToken } from './auth'

import type { D1Database } from '@cloudflare/workers-types'

type Bindings = {
  DB: D1Database
  OPENAI_API_KEY: string
  OPENAI_BASE_URL: string
  JWT_SECRET: string
}

export const aiRoutes = new Hono<{ Bindings: Bindings }>()

async function getUser(c: any): Promise<any> {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) throw new Error('Unauthorized')
  return verifyToken(authHeader.split(' ')[1], c.env.JWT_SECRET)
}

// Helper to reliably construct OpenAI API URL
function getChatCompletionUrl(baseUrl: string) {
  return baseUrl.endsWith('/') ? `${baseUrl}chat/completions` : `${baseUrl}/chat/completions`;
}

// Chat-style AI endpoint for conversational interview
aiRoutes.post('/chat', async (c) => {
  try {
    const user = await getUser(c)
    const { message, context } = await c.req.json()

    if (!c.env.OPENAI_API_KEY || !c.env.OPENAI_BASE_URL) {
      throw new Error("Missing OPENAI_API_KEY or OPENAI_BASE_URL in environment.");
    }

    const url = getChatCompletionUrl(c.env.OPENAI_BASE_URL);
    let attempt = 0;
    const maxRetries = 3;
    let response: Response | null = null;

    while (attempt < maxRetries) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      try {
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${c.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'arcee-ai/trinity-large-preview:free',
            messages: [
              {
                role: 'system',
                content: `You are a professional and friendly AI interviewer named "Alex". You conduct interviews in a natural, conversational manner. Be encouraging but honest. Keep responses concise (2-3 sentences max for follow-ups). ${context || ''}`
              },
              { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 8000
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) break;

        const errText = await response.text();
        if (response.status === 429) {
          attempt++;
          if (errText.includes('GenerateRequestsPerDayPerProjectPerModel-FreeTier')) {
            console.error("LLM Daily Quota exhausted:", errText);
            throw new Error("Google AI Daily Limit Exceeded (20/day). Please try again tomorrow or upgrade your API key's billing plan in Google AI Studio.");
          }
          if (attempt >= maxRetries) throw new Error("Google AI Rate Limit Exceeded: Wait 60 seconds and try again.");
          console.warn(`/chat Rate limit hit. Retrying attempt ${attempt}... waiting 10s`);
          await new Promise(res => setTimeout(res, 10000));
          continue;
        }

        console.error("AI /chat error:", response.status, errText);
        throw new Error(`AI API Error ${response.status}: ${errText}`);
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError' && attempt < maxRetries - 1) {
          attempt++;
          console.warn(`/chat Request timeout. Retrying attempt ${attempt}...`);
          await new Promise(res => setTimeout(res, 3000));
          continue;
        }
        throw err;
      }
    }

    if (!response || !response.ok) throw new Error("LLM Call failed unexpectedly.");

    const data: any = await response.json()
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) throw new Error("AI returned empty content");

    return c.json({ reply })
  } catch (err: any) {
    console.error("Error in /api/ai/chat:", err.message);
    return c.json({ error: err.message }, 500)
  }
})

// Resume improvement suggestions
aiRoutes.post('/resume-suggestions', async (c) => {
  try {
    const user = await getUser(c)
    const { resumeText } = await c.req.json()

    if (!c.env.OPENAI_API_KEY || !c.env.OPENAI_BASE_URL) {
      throw new Error("Missing OPENAI_API_KEY or OPENAI_BASE_URL in environment.");
    }

    const url = getChatCompletionUrl(c.env.OPENAI_BASE_URL);
    let attempt = 0;
    const maxRetries = 3;
    let response: Response | null = null;

    while (attempt < maxRetries) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${c.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'arcee-ai/trinity-large-preview:free',
            messages: [
              {
                role: 'system',
                content: `You are an expert resume reviewer. Analyze the resume and provide improvement suggestions.
Return JSON:
{
  "overall_rating": 0-10,
  "suggestions": [
    {"category": "category", "suggestion": "specific suggestion", "priority": "high|medium|low"}
  ],
  "missing_sections": ["section1", "section2"],
  "keyword_suggestions": ["keyword1", "keyword2"]
}
Return ONLY valid JSON.`
              },
              { role: 'user', content: `Review this resume:\n${resumeText}` }
            ],
            temperature: 0.3,
            max_tokens: 8000
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) break;

        const errText = await response.text();
        if (response.status === 429) {
          attempt++;
          if (errText.includes('GenerateRequestsPerDayPerProjectPerModel-FreeTier')) {
            console.error("LLM Daily Quota exhausted:", errText);
            throw new Error("Google AI Daily Limit Exceeded (20/day). Please try again tomorrow or upgrade your API key's billing plan in Google AI Studio.");
          }
          if (attempt >= maxRetries) throw new Error("Google AI Rate Limit Exceeded: Wait 60 seconds and try again.");
          console.warn(`/resume-suggestions Rate limit hit. Retrying attempt ${attempt}... waiting 10s`);
          await new Promise(res => setTimeout(res, 10000));
          continue;
        }

        console.error("AI /resume-suggestions error:", response.status, errText);
        throw new Error(`AI API Error ${response.status}: ${errText}`);
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError' && attempt < maxRetries - 1) {
          attempt++;
          console.warn(`/resume-suggestions Request timeout. Retrying attempt ${attempt}...`);
          await new Promise(res => setTimeout(res, 3000));
          continue;
        }
        throw err;
      }
    }

    if (!response || !response.ok) throw new Error("LLM Call failed unexpectedly.");

    const data: any = await response.json()
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("AI returned empty content");

    const cleaned = content.replace(/```json\n?|\n?```/g, '').trim()
    return c.json(JSON.parse(cleaned))
  } catch (err: any) {
    console.error("Error in /api/ai/resume-suggestions:", err.message);
    return c.json({ error: err.message }, 500)
  }
})

// Generate interview tips
aiRoutes.post('/interview-tips', async (c) => {
  try {
    const user = await getUser(c)
    const { type, skills } = await c.req.json()

    if (!c.env.OPENAI_API_KEY || !c.env.OPENAI_BASE_URL) {
      throw new Error("Missing OPENAI_API_KEY or OPENAI_BASE_URL in environment.");
    }

    const url = getChatCompletionUrl(c.env.OPENAI_BASE_URL);
    let attempt = 0;
    const maxRetries = 3;
    let response: Response | null = null;

    while (attempt < maxRetries) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      try {
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${c.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'arcee-ai/trinity-large-preview:free',
            messages: [
              {
                role: 'system',
                content: 'You are a career coach. Provide interview preparation tips. Return JSON: {"tips": [{"title": "...", "description": "...", "category": "..."}], "commonQuestions": ["q1", "q2"]}. Return ONLY valid JSON.'
              },
              { role: 'user', content: `Give tips for a ${type} interview. Relevant skills: ${(skills || []).join(', ')}` }
            ],
            temperature: 0.5,
            max_tokens: 8000
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) break;

        const errText = await response.text();
        if (response.status === 429) {
          attempt++;
          if (errText.includes('GenerateRequestsPerDayPerProjectPerModel-FreeTier')) {
            console.error("LLM Daily Quota exhausted:", errText);
            throw new Error("Google AI Daily Limit Exceeded (20/day). Please try again tomorrow or upgrade your API key's billing plan in Google AI Studio.");
          }
          if (attempt >= maxRetries) throw new Error("Google AI Rate Limit Exceeded: Wait 60 seconds and try again.");
          console.warn(`/interview-tips Rate limit hit. Retrying attempt ${attempt}... waiting 10s`);
          await new Promise(res => setTimeout(res, 10000));
          continue;
        }

        console.error("AI /interview-tips error:", response.status, errText);
        throw new Error(`AI API Error ${response.status}: ${errText}`);
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError' && attempt < maxRetries - 1) {
          attempt++;
          console.warn(`/interview-tips Request timeout. Retrying attempt ${attempt}...`);
          await new Promise(res => setTimeout(res, 3000));
          continue;
        }
        throw err;
      }
    }

    if (!response || !response.ok) throw new Error("LLM Call failed unexpectedly.");

    const data: any = await response.json()
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("AI returned empty content");

    const cleaned = content.replace(/```json\n?|\n?```/g, '').trim()
    return c.json(JSON.parse(cleaned))
  } catch (err: any) {
    console.error("Error in /api/ai/interview-tips:", err.message);
    return c.json({ error: err.message }, 500)
  }
})
