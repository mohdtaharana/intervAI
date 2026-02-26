// AI Engine - Strict LLM API integration. No dummy fallbacks!

export interface QuestionResult {
  text: string;
  type: string;
  difficulty: string;
}

export interface AnalysisResult {
  score: number;
  communication: number;
  technical: number;
  confidence: number;
  clarity: number;
  feedback: string;
}

export interface FeedbackResult {
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  skill_gaps: string[];
  learning_roadmap: string[];
}

export interface ResumeData {
  name: string;
  email?: string;
  phone?: string;
  summary: string;
  skills: string[];
  experience: { title: string; company: string; duration: string; highlights: string[] }[];
  education: { degree: string; institution: string; year: string }[];
  projects: { name: string; description: string; technologies: string[] }[];
  certifications: string[];
  years_of_experience: string;
  expertise_level: string;
  ats_score: number;
  ats_feedback: string;
  missing_keywords: string[];
}

async function tryLLMCall(
  apiKey: string, baseUrl: string,
  systemPrompt: string, userPrompt: string,
  temp = 0.7, maxTokens = 8000
): Promise<string> {
  if (!apiKey || !baseUrl) throw new Error("Missing OPENAI_API_KEY or OPENAI_BASE_URL in environment variables. Please check your .dev.vars");

  const url = baseUrl.endsWith('/') ? `${baseUrl}chat/completions` : `${baseUrl}/chat/completions`;
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'arcee-ai/trinity-large-preview:free',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: temp,
          max_tokens: maxTokens
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data: any = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) throw new Error("LLM API returned empty content");
        return content;
      }

      const errText = await response.text();

      // Handle rate limits explicitly
      if (response.status === 429) {
        attempt++;
        if (errText.includes('GenerateRequestsPerDayPerProjectPerModel-FreeTier')) {
          console.error("LLM Daily Quota exhausted:", errText);
          throw new Error("Google AI Daily Limit Exceeded (20/day). Please try again tomorrow or upgrade your API key's billing plan in Google AI Studio.");
        }

        if (attempt >= maxRetries) {
          console.error("LLM Rate limit exceeded repeatedly:", errText);
          throw new Error("Google AI Rate Limit Exceeded: Wait 60 seconds before trying again.");
        }
        console.warn(`Rate limit hit. Retrying attempt ${attempt}... waiting 10s`);
        await new Promise(res => setTimeout(res, 10000)); // wait 10 seconds before retry
        continue;
      }

      console.error("LLM API request failed:", response.status, errText);
      throw new Error(`LLM API request failed: ${response.status} - ${errText}`);

    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        if (attempt < maxRetries - 1) {
          attempt++;
          console.warn(`Request timeout. Retrying attempt ${attempt}...`);
          await new Promise(res => setTimeout(res, 3000));
          continue;
        }
        throw new Error("LLM API request timed out after multiple attempts.");
      }
      throw err;
    }
  }

  throw new Error("LLM Call failed unexpectedly");
}

function parseJSON(text: string): any {
  try {
    // 0. Strip DeepSeek reasoning tokens if present
    let cleaned = text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

    // 1. Remove markdown blocks entirely
    cleaned = cleaned.replace(/```json\s?/g, '').replace(/```\s?/g, '').trim();

    // 2. Try to find the start of a JSON block
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');

    let startIndex = -1;
    let isArray = false;

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      startIndex = firstBrace;
      isArray = false;
    } else if (firstBracket !== -1) {
      startIndex = firstBracket;
      isArray = true;
    }

    if (startIndex !== -1) {
      const charStack: string[] = [];
      const opener = isArray ? '[' : '{';
      const closer = isArray ? ']' : '}';

      let endIndex = -1;
      for (let i = startIndex; i < cleaned.length; i++) {
        if (cleaned[i] === opener) charStack.push(opener);
        else if (cleaned[i] === closer) {
          charStack.pop();
          if (charStack.length === 0) {
            endIndex = i;
            break;
          }
        }
      }

      if (endIndex !== -1) {
        cleaned = cleaned.substring(startIndex, endIndex + 1);
      }
    }

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("JSON parse failed. Raw text was:", text);
    throw new Error("Failed to parse LLM JSON response. The AI response might be malformed or non-JSON.");
  }
}

export async function parseResume(text: string, apiKey: string, baseUrl: string): Promise<ResumeData> {
  const llmResult = await tryLLMCall(apiKey, baseUrl,
    `You are an expert resume parser. Extract structured information and return ONLY valid JSON:
{
  "name": "candidate name",
  "email": "email if found",
  "summary": "brief professional summary",
  "skills": ["skill1", "skill2"],
  "experience": [{"title": "job title", "company": "company", "duration": "period", "highlights": ["h1"]}],
  "education": [{"degree": "degree", "institution": "school", "year": "year"}],
  "projects": [{"name": "name", "description": "desc", "technologies": ["t1"]}],
  "certifications": [],
  "years_of_experience": "e.g. 5 years or 6 months",
  "expertise_level": "junior|mid|senior|lead",
  "ats_score": 0,
  "ats_feedback": "detailed ATS optimization feedback",
  "missing_keywords": ["keyword1", "keyword2"]
}`,
    `Parse this resume:\n\n${text.substring(0, 6000)}`,
    0.1, 8000
  );

  const parsed = parseJSON(llmResult);
  if (parsed && parsed.skills) return parsed;
  throw new Error("Failed to extract valid resume data format");
}

export async function generateQuestions(
  resumeData: any, type: string, language: string, questionNum: number,
  apiKey: string, baseUrl: string
): Promise<QuestionResult[]> {
  const resumeContext = resumeData ? `Candidate: ${resumeData.name}, Skills: ${(resumeData.skills || []).join(', ')}, Level: ${resumeData.expertise_level}` : '';
  const languageContext = language === 'ur' ? 'Provide the question in BOTH English and Urdu (e.g., "English? / اردو؟")' : `Provide the question in ${language || 'English'}.`;

  const llmResult = await tryLLMCall(apiKey, baseUrl,
    `You are an expert ${type} interviewer. Generate 1 interview question${resumeContext ? ' personalized for: ' + resumeContext : ''}. 
    ${languageContext}
    Allowed types: technical, behavioral, hr, situational, project.
    CRITICAL: YOU MUST RETURN ONLY A VALID JSON ARRAY. NO TEXT BEFORE OR AFTER. NO EXPLANATIONS.
    Example: [{"text": "...", "type": "...", "difficulty": "..."}]`,
    `Generate opening question for a ${type} interview.`,
    0.7, 8000
  );

  const parsed = parseJSON(llmResult);
  if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  throw new Error("Failed to extract valid question data");
}

export async function generateAdaptiveQuestion(
  resumeData: any, type: string, language: string,
  previousQA: any[], lastAnalysis: AnalysisResult,
  apiKey: string, baseUrl: string
): Promise<QuestionResult[]> {
  const prevContext = previousQA.map((qa: any, i: number) =>
    `Q${i + 1}: ${qa.question_text}\nA: ${qa.answer_text || '(skipped)'}`
  ).join('\n');

  const difficultyHint = lastAnalysis.score < 5 ? 'Candidate struggled. Ask an easier follow-up.' : lastAnalysis.score >= 8 ? 'Candidate excelled. Ask a harder question.' : 'Continue naturally.';
  const languageContext = language === 'ur' ? 'Provide the question in BOTH English and Urdu (e.g., "English? / اردو؟")' : `Provide the question in ${language || 'English'}.`;

  const llmResult = await tryLLMCall(apiKey, baseUrl,
    `You are an expert interviewer conducting a ${type} interview.
${resumeData ? `Candidate skills: ${(resumeData.skills || []).join(', ')}` : ''}
${difficultyHint}
${languageContext}
Allowed types: technical, behavioral, hr, situational, project.

STRICT RULES FOR QUESTION GENERATION:
1. DO NOT REPEAT any question from the history below.
2. DO NOT ASK questions that are semantically identical to previous ones (e.g., if you asked about "React life cycles", don't ask it again).
3. If the candidate SKIPPED a question, DO NOT ask it again. Move to a completely different topic or a different sub-topic.
4. Your goal is to cover as much breadth and depth as possible without duplication.

Previous conversation history (DO NOT REPEAT THESE):
${prevContext}

CRITICAL: Generate 1 unique follow-up question. 
YOUR ENTIRE RESPONSE MUST BE A VALID JSON ARRAY. NO CONVERSATIONAL FILLER.
Return ONLY JSON: [{"text": "question", "type": "type", "difficulty": "easy|medium|hard"}]`,
    'Generate next unique question.',
    0.7, 8000
  );

  const parsed = parseJSON(llmResult);
  if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  throw new Error("Failed to extract valid follow-up question data");
}

export async function analyzeAnswer(
  question: string, answer: string, questionType: string,
  apiKey: string, baseUrl: string
): Promise<AnalysisResult> {
  const llmResult = await tryLLMCall(apiKey, baseUrl,
    `You are an expert interview evaluator. Score the candidate's answer.
Score 0-10 for: communication, technical, confidence, clarity, and overall score.
Provide brief constructive feedback.
CRITICAL: YOUR ENTIRE RESPONSE MUST BE A VALID JSON OBJECT. NO MARKDOWN OUTSIDE THE JSON. NO PREAMBLE.
Return ONLY valid JSON: {"score": N, "communication": N, "technical": N, "confidence": N, "clarity": N, "feedback": "..."}`,
    `Question (${questionType}): ${question}\nAnswer: ${answer}`,
    0.3, 8000
  );

  const parsed = parseJSON(llmResult);
  if (parsed && typeof parsed.score === 'number') return parsed;
  throw new Error("Failed to extract valid analysis data");
}

export async function generateOverallFeedback(
  questions: any[], scores: any,
  apiKey: string, baseUrl: string
): Promise<FeedbackResult> {
  const qaSummary = questions.map((q: any, i: number) =>
    `Q${i + 1}: ${q.question_text}\nA: ${q.answer_text || '(skipped)'}\nScore: ${q.score}/10`
  ).join('\n\n');

  const answeredCount = questions.filter((q: any) => q.answer_text && q.answer_text !== '[Skipped]').length;
  const totalCount = questions.length;

  const llmResult = await tryLLMCall(apiKey, baseUrl,
    `You are a strict, honest interview evaluator. Do NOT sugarcoat or be falsely positive.

SCORES (out of 10):
- Overall: ${scores.total}/10
- Communication: ${scores.communication}/10
- Technical: ${scores.technical}/10
- Confidence: ${scores.confidence}/10
- Clarity: ${scores.clarity}/10

SESSION STATS:
- Questions answered: ${answeredCount} out of ${totalCount}
- Skipped/unanswered: ${totalCount - answeredCount}

Q&A DETAILS:
${qaSummary}

STRICT RULES:
1. Your feedback MUST reflect the actual scores above. If scores are low (0-4), the feedback must be critical and honest.
2. If most questions were skipped or unanswered, clearly state the candidate did not attempt the interview properly.
3. Do NOT list strengths that are not supported by the actual answers given.
4. Weaknesses and skill_gaps must be specific to what the candidate actually failed to demonstrate.
5. If the candidate gave very little or no answers, strengths list should be empty or minimal.

CRITICAL: YOUR ENTIRE RESPONSE MUST BE A VALID JSON OBJECT. NO EXPLANATIONS.
Return ONLY valid JSON: {
  "feedback": "honest overall summary",
  "strengths": ["only real strengths shown in answers"],
  "weaknesses": ["specific weaknesses based on actual performance"],
  "improvements": ["actionable improvements"],
  "skill_gaps": ["specific gaps identified"],
  "learning_roadmap": ["concrete next steps"]
}`,
    'Provide honest interview feedback strictly based on actual performance.',
    0.3, 8000
  );

  const parsed = parseJSON(llmResult);
  if (parsed && parsed.feedback) return parsed;
  throw new Error("Failed to extract valid feedback data");
}
