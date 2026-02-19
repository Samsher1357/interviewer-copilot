import { database } from './database';

export interface InterviewSessionData {
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  role: string;
  experienceYears?: number;
  interviewerName: string;
  interviewerEmail: string;
  round: string;
}

export interface QuestionAnswerData {
  question: string;
  answer: string;
  analysis?: string;
  rating?: number;
  competency?: string;
  timestamp: Date;
}

export interface InterviewScoreData {
  technical_competency: number;
  communication_skills: number;
  problem_solving: number;
  cultural_fit: number;
  overall_score: number;
  strengths: string;
  weaknesses: string;
  recommendation: string;
}

class InterviewDataService {
  // Create or get candidate
  async upsertCandidate(data: {
    name: string;
    email: string;
    phone?: string;
    role: string;
    experienceYears?: number;
  }): Promise<number> {
    // Check if candidate exists
    const existingResult = await database.query(
      'SELECT id FROM candidates WHERE email = $1',
      [data.email]
    );

    if (existingResult.rows.length > 0) {
      // Update existing candidate
      await database.query(
        `UPDATE candidates 
         SET name = $1, phone = $2, role = $3, experience_years = $4, updated_at = CURRENT_TIMESTAMP
         WHERE email = $5`,
        [data.name, data.phone, data.role, data.experienceYears, data.email]
      );
      return existingResult.rows[0].id;
    }

    // Create new candidate
    const result = await database.query(
      `INSERT INTO candidates (name, email, phone, role, experience_years)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [data.name, data.email, data.phone, data.role, data.experienceYears]
    );

    return result.rows[0].id;
  }

  // Create or get interviewer
  async upsertInterviewer(data: {
    name: string;
    email: string;
    department?: string;
  }): Promise<number> {
    const existingResult = await database.query(
      'SELECT id FROM interviewers WHERE email = $1',
      [data.email]
    );

    if (existingResult.rows.length > 0) {
      return existingResult.rows[0].id;
    }

    const result = await database.query(
      `INSERT INTO interviewers (name, email, department)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [data.name, data.email, data.department]
    );

    return result.rows[0].id;
  }

  // Start interview session
  async startInterview(sessionData: InterviewSessionData): Promise<number> {
    const candidateId = await this.upsertCandidate({
      name: sessionData.candidateName,
      email: sessionData.candidateEmail,
      phone: sessionData.candidatePhone,
      role: sessionData.role,
      experienceYears: sessionData.experienceYears,
    });

    const interviewerId = await this.upsertInterviewer({
      name: sessionData.interviewerName,
      email: sessionData.interviewerEmail,
    });

    const result = await database.query(
      `INSERT INTO interviews (candidate_id, interviewer_id, round, interview_date, status)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, 'in_progress')
       RETURNING id`,
      [candidateId, interviewerId, sessionData.round]
    );

    return result.rows[0].id;
  }

  // Update interview with Q&A and notes
  async updateInterviewNotes(interviewId: number, notes: string): Promise<void> {
    await database.query(
      `UPDATE interviews 
       SET notes = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [notes, interviewId]
    );
  }

  // Complete interview with final scores
  async completeInterview(
    interviewId: number,
    scoreData: InterviewScoreData,
    durationMinutes?: number
  ): Promise<void> {
    // Update interview status
    await database.query(
      `UPDATE interviews 
       SET status = 'completed', duration_minutes = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [durationMinutes, interviewId]
    );

    // Insert or update scores
    const existingScore = await database.query(
      'SELECT id FROM interview_scores WHERE interview_id = $1',
      [interviewId]
    );

    if (existingScore.rows.length > 0) {
      await database.query(
        `UPDATE interview_scores 
         SET technical_competency = $1, communication_skills = $2, problem_solving = $3,
             cultural_fit = $4, overall_score = $5, strengths = $6, weaknesses = $7,
             recommendation = $8, updated_at = CURRENT_TIMESTAMP
         WHERE interview_id = $9`,
        [
          scoreData.technical_competency,
          scoreData.communication_skills,
          scoreData.problem_solving,
          scoreData.cultural_fit,
          scoreData.overall_score,
          scoreData.strengths,
          scoreData.weaknesses,
          scoreData.recommendation,
          interviewId,
        ]
      );
    } else {
      await database.query(
        `INSERT INTO interview_scores 
         (interview_id, technical_competency, communication_skills, problem_solving,
          cultural_fit, overall_score, strengths, weaknesses, recommendation)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          interviewId,
          scoreData.technical_competency,
          scoreData.communication_skills,
          scoreData.problem_solving,
          scoreData.cultural_fit,
          scoreData.overall_score,
          scoreData.strengths,
          scoreData.weaknesses,
          scoreData.recommendation,
        ]
      );
    }
  }

  // Get interview by ID
  async getInterview(interviewId: number): Promise<any> {
    const result = await database.query(
      `SELECT i.*, c.name as candidate_name, c.email as candidate_email,
              iv.name as interviewer_name, s.*
       FROM interviews i
       JOIN candidates c ON i.candidate_id = c.id
       JOIN interviewers iv ON i.interviewer_id = iv.id
       LEFT JOIN interview_scores s ON i.id = s.interview_id
       WHERE i.id = $1`,
      [interviewId]
    );

    return result.rows[0];
  }

  // Delete candidate and all related data
  async deleteCandidate(candidateId: number): Promise<void> {
    // CASCADE will automatically delete related interviews and scores
    await database.query('DELETE FROM candidates WHERE id = $1', [candidateId]);
  }

  // Calculate scores from ratings
  calculateAverageScores(ratings: Array<{ score: number; competency: string }>): {
    technical_competency: number;
    communication_skills: number;
    problem_solving: number;
    cultural_fit: number;
    overall_score: number;
  } {
    const competencyMap: Record<string, number[]> = {
      technical: [],
      communication: [],
      problem_solving: [],
      cultural_fit: [],
    };

    // Group ratings by competency
    ratings.forEach(r => {
      const comp = r.competency?.toLowerCase() || 'technical';
      if (comp.includes('technical') || comp.includes('coding')) {
        competencyMap.technical.push(r.score);
      } else if (comp.includes('communication')) {
        competencyMap.communication.push(r.score);
      } else if (comp.includes('problem')) {
        competencyMap.problem_solving.push(r.score);
      } else if (comp.includes('cultural') || comp.includes('culture')) {
        competencyMap.cultural_fit.push(r.score);
      } else {
        // Default to technical
        competencyMap.technical.push(r.score);
      }
    });

    const avg = (arr: number[]) => arr.length > 0 
      ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 2) / 2 
      : 5;

    const technical = avg(competencyMap.technical);
    const communication = avg(competencyMap.communication);
    const problemSolving = avg(competencyMap.problem_solving);
    const culturalFit = avg(competencyMap.cultural_fit);

    const overall = Math.round(((technical + communication + problemSolving + culturalFit) / 4) * 2) / 2;

    return {
      technical_competency: technical,
      communication_skills: communication,
      problem_solving: problemSolving,
      cultural_fit: culturalFit,
      overall_score: overall,
    };
  }

  // Extract strengths and weaknesses from analysis texts
  extractInsights(analysisTexts: string[]): { strengths: string; weaknesses: string } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    analysisTexts.forEach(text => {
      // Extract strengths
      const strengthMatch = text.match(/\*\*Strengths:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
      if (strengthMatch) {
        const items = strengthMatch[1]
          .split(/[•\-\n]/)
          .map(s => s.trim())
          .filter(s => s.length > 5);
        strengths.push(...items);
      }

      // Extract concerns/weaknesses
      const concernMatch = text.match(/\*\*Concerns?:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
      if (concernMatch) {
        const items = concernMatch[1]
          .split(/[•\-\n]/)
          .map(s => s.trim())
          .filter(s => s.length > 5 && !s.toLowerCase().includes('none'));
        weaknesses.push(...items);
      }
    });

    return {
      strengths: strengths.slice(0, 5).join('; ') || 'Strong technical skills',
      weaknesses: weaknesses.slice(0, 3).join('; ') || 'None significant',
    };
  }

  // Generate recommendation based on overall score
  generateRecommendation(overallScore: number): string {
    if (overallScore >= 8) return 'Strong Hire';
    if (overallScore >= 7) return 'Hire';
    if (overallScore >= 5) return 'Maybe';
    return 'No Hire';
  }
}

export const interviewDataService = new InterviewDataService();
