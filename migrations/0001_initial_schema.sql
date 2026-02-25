-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
  avatar_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  raw_text TEXT,
  parsed_data TEXT, -- JSON: skills, experience, education, projects
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  resume_id TEXT,
  type TEXT DEFAULT 'technical' CHECK(type IN ('technical', 'hr', 'behavioral', 'mixed')),
  status TEXT DEFAULT 'in_progress' CHECK(status IN ('in_progress', 'completed', 'cancelled')),
  language TEXT DEFAULT 'en',
  total_score REAL DEFAULT 0,
  communication_score REAL DEFAULT 0,
  technical_score REAL DEFAULT 0,
  confidence_score REAL DEFAULT 0,
  clarity_score REAL DEFAULT 0,
  overall_feedback TEXT,
  strengths TEXT, -- JSON array
  weaknesses TEXT, -- JSON array
  improvements TEXT, -- JSON array
  duration_seconds INTEGER DEFAULT 0,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE SET NULL
);

-- Interview questions table
CREATE TABLE IF NOT EXISTS interview_questions (
  id TEXT PRIMARY KEY,
  interview_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'technical' CHECK(question_type IN ('technical', 'behavioral', 'hr', 'situational', 'project')),
  difficulty TEXT DEFAULT 'medium' CHECK(difficulty IN ('easy', 'medium', 'hard')),
  order_num INTEGER NOT NULL,
  answer_text TEXT,
  answer_audio_url TEXT,
  score REAL DEFAULT 0,
  feedback TEXT,
  communication_score REAL DEFAULT 0,
  technical_score REAL DEFAULT 0,
  confidence_score REAL DEFAULT 0,
  clarity_score REAL DEFAULT 0,
  asked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  answered_at DATETIME,
  FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_resumes_user ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_user ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_interview ON interview_questions(interview_id);
