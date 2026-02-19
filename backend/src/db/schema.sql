-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(100) NOT NULL,
  experience_years INTEGER,
  resume_url TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interviewers table
CREATE TABLE IF NOT EXISTS interviewers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  department VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id SERIAL PRIMARY KEY,
  candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  interviewer_id INTEGER NOT NULL REFERENCES interviewers(id),
  round VARCHAR(100) NOT NULL,
  interview_date TIMESTAMP NOT NULL,
  duration_minutes INTEGER,
  status VARCHAR(50) DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Interview scores table
CREATE TABLE IF NOT EXISTS interview_scores (
  id SERIAL PRIMARY KEY,
  interview_id INTEGER NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  technical_competency DECIMAL(3,1) CHECK (technical_competency >= 0 AND technical_competency <= 10),
  communication_skills DECIMAL(3,1) CHECK (communication_skills >= 0 AND communication_skills <= 10),
  problem_solving DECIMAL(3,1) CHECK (problem_solving >= 0 AND problem_solving <= 10),
  cultural_fit DECIMAL(3,1) CHECK (cultural_fit >= 0 AND cultural_fit <= 10),
  overall_score DECIMAL(3,1) CHECK (overall_score >= 0 AND overall_score <= 10),
  strengths TEXT,
  weaknesses TEXT,
  recommendation VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_candidates_role ON candidates(role);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_interviews_candidate ON interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_interviewer ON interviews(interviewer_id);
CREATE INDEX IF NOT EXISTS idx_interviews_date ON interviews(interview_date);
CREATE INDEX IF NOT EXISTS idx_interviews_round ON interviews(round);
CREATE INDEX IF NOT EXISTS idx_scores_interview ON interview_scores(interview_id);
