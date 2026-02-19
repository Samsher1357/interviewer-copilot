export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  experience_years?: number;
  resume_url?: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface Interviewer {
  id: number;
  name: string;
  email: string;
  department?: string;
}

export interface Interview {
  id: number;
  candidate_id: number;
  interviewer_id: number;
  round: string;
  interview_date: Date;
  duration_minutes?: number;
  status: string;
  notes?: string;
}

export interface InterviewScore {
  id: number;
  interview_id: number;
  technical_competency: number;
  communication_skills: number;
  problem_solving: number;
  cultural_fit: number;
  overall_score: number;
  strengths?: string;
  weaknesses?: string;
  recommendation?: string;
}

export interface CandidateWithScores extends Candidate {
  interviews: Array<Interview & {
    interviewer: Interviewer;
    score?: InterviewScore;
  }>;
  averageScores: {
    technical_competency: number;
    communication_skills: number;
    problem_solving: number;
    cultural_fit: number;
    overall_score: number;
  };
  totalInterviews: number;
}

export interface CandidateFilters {
  role?: string;
  round?: string;
  interviewer?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}
