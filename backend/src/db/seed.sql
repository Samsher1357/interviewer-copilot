-- Sample interviewers
INSERT INTO interviewers (name, email, department) VALUES
('John Smith', 'john.smith@company.com', 'Engineering'),
('Sarah Johnson', 'sarah.johnson@company.com', 'Engineering'),
('Mike Chen', 'mike.chen@company.com', 'Product'),
('Emily Davis', 'emily.davis@company.com', 'HR')
ON CONFLICT (email) DO NOTHING;

-- Sample candidates
INSERT INTO candidates (name, email, phone, role, experience_years, status) VALUES
('Alice Williams', 'alice.w@email.com', '+1-555-0101', 'Senior Software Engineer', 5, 'active'),
('Bob Martinez', 'bob.m@email.com', '+1-555-0102', 'Senior Software Engineer', 6, 'active'),
('Carol Taylor', 'carol.t@email.com', '+1-555-0103', 'Senior Software Engineer', 4, 'active'),
('David Brown', 'david.b@email.com', '+1-555-0104', 'Frontend Developer', 3, 'active'),
('Emma Wilson', 'emma.w@email.com', '+1-555-0105', 'Backend Developer', 4, 'active'),
('Frank Anderson', 'frank.a@email.com', '+1-555-0106', 'Full Stack Developer', 5, 'active')
ON CONFLICT (email) DO NOTHING;

-- Sample interviews (using subqueries to get IDs)
INSERT INTO interviews (candidate_id, interviewer_id, round, interview_date, duration_minutes, status, notes)
SELECT 
  c.id,
  i.id,
  'Technical Round 1',
  CURRENT_TIMESTAMP - INTERVAL '5 days',
  60,
  'completed',
  'Strong technical skills, good problem-solving approach'
FROM candidates c, interviewers i
WHERE c.email = 'alice.w@email.com' AND i.email = 'john.smith@company.com';

INSERT INTO interviews (candidate_id, interviewer_id, round, interview_date, duration_minutes, status, notes)
SELECT 
  c.id,
  i.id,
  'Technical Round 2',
  CURRENT_TIMESTAMP - INTERVAL '3 days',
  60,
  'completed',
  'Excellent system design knowledge'
FROM candidates c, interviewers i
WHERE c.email = 'alice.w@email.com' AND i.email = 'sarah.johnson@company.com';

INSERT INTO interviews (candidate_id, interviewer_id, round, interview_date, duration_minutes, status, notes)
SELECT 
  c.id,
  i.id,
  'Technical Round 1',
  CURRENT_TIMESTAMP - INTERVAL '4 days',
  60,
  'completed',
  'Good coding skills, needs improvement in algorithms'
FROM candidates c, interviewers i
WHERE c.email = 'bob.m@email.com' AND i.email = 'john.smith@company.com';

INSERT INTO interviews (candidate_id, interviewer_id, round, interview_date, duration_minutes, status, notes)
SELECT 
  c.id,
  i.id,
  'Technical Round 1',
  CURRENT_TIMESTAMP - INTERVAL '2 days',
  60,
  'completed',
  'Creative problem solver, great communication'
FROM candidates c, interviewers i
WHERE c.email = 'carol.t@email.com' AND i.email = 'sarah.johnson@company.com';

-- Sample scores
INSERT INTO interview_scores (interview_id, technical_competency, communication_skills, problem_solving, cultural_fit, overall_score, strengths, weaknesses, recommendation)
SELECT 
  i.id,
  9,
  8,
  9,
  8,
  9,
  'Strong algorithms knowledge, clean code, good architecture understanding',
  'Could improve on explaining complex concepts to non-technical stakeholders',
  'Strong Hire'
FROM interviews i
JOIN candidates c ON i.candidate_id = c.id
WHERE c.email = 'alice.w@email.com' AND i.round = 'Technical Round 1';

INSERT INTO interview_scores (interview_id, technical_competency, communication_skills, problem_solving, cultural_fit, overall_score, strengths, weaknesses, recommendation)
SELECT 
  i.id,
  9,
  9,
  10,
  9,
  9,
  'Exceptional system design skills, scalability mindset, great team player',
  'None significant',
  'Strong Hire'
FROM interviews i
JOIN candidates c ON i.candidate_id = c.id
WHERE c.email = 'alice.w@email.com' AND i.round = 'Technical Round 2';

INSERT INTO interview_scores (interview_id, technical_competency, communication_skills, problem_solving, cultural_fit, overall_score, strengths, weaknesses, recommendation)
SELECT 
  i.id,
  7,
  8,
  6,
  7,
  7,
  'Good practical experience, fast learner, positive attitude',
  'Algorithm optimization needs work, sometimes rushes to solution',
  'Hire'
FROM interviews i
JOIN candidates c ON i.candidate_id = c.id
WHERE c.email = 'bob.m@email.com' AND i.round = 'Technical Round 1';

INSERT INTO interview_scores (interview_id, technical_competency, communication_skills, problem_solving, cultural_fit, overall_score, strengths, weaknesses, recommendation)
SELECT 
  i.id,
  8,
  9,
  8,
  9,
  8,
  'Excellent communication, creative solutions, collaborative mindset',
  'Limited experience with distributed systems',
  'Hire'
FROM interviews i
JOIN candidates c ON i.candidate_id = c.id
WHERE c.email = 'carol.t@email.com' AND i.round = 'Technical Round 1';
