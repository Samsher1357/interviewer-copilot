import { database } from './database';
import { Candidate, CandidateWithScores, CandidateFilters } from '../types/candidate';

export class CandidateService {
  async getCandidates(filters: CandidateFilters = {}): Promise<CandidateWithScores[]> {
    let query = `
      SELECT DISTINCT c.*
      FROM candidates c
      LEFT JOIN interviews i ON c.id = i.candidate_id
      LEFT JOIN interviewers iv ON i.interviewer_id = iv.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters.role) {
      query += ` AND c.role = $${paramIndex}`;
      params.push(filters.role);
      paramIndex++;
    }

    if (filters.status) {
      query += ` AND c.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.round) {
      query += ` AND i.round = $${paramIndex}`;
      params.push(filters.round);
      paramIndex++;
    }

    if (filters.interviewer) {
      query += ` AND iv.name ILIKE $${paramIndex}`;
      params.push(`%${filters.interviewer}%`);
      paramIndex++;
    }

    if (filters.dateFrom) {
      query += ` AND i.interview_date >= $${paramIndex}`;
      params.push(filters.dateFrom);
      paramIndex++;
    }

    if (filters.dateTo) {
      query += ` AND i.interview_date <= $${paramIndex}`;
      params.push(filters.dateTo);
      paramIndex++;
    }

    query += ' ORDER BY c.created_at DESC';

    const result = await database.query(query, params);
    const candidates = result.rows;

    // Fetch detailed data for each candidate
    const candidatesWithScores = await Promise.all(
      candidates.map(candidate => this.getCandidateById(candidate.id))
    );

    return candidatesWithScores;
  }

  async getCandidateById(id: number): Promise<CandidateWithScores> {
    const candidateResult = await database.query(
      'SELECT * FROM candidates WHERE id = $1',
      [id]
    );

    if (candidateResult.rows.length === 0) {
      throw new Error('Candidate not found');
    }

    const candidate = candidateResult.rows[0];

    // Fetch interviews with scores and interviewer info
    const interviewsResult = await database.query(
      `
      SELECT 
        i.*,
        iv.name as interviewer_name,
        iv.email as interviewer_email,
        iv.department as interviewer_department,
        s.technical_competency,
        s.communication_skills,
        s.problem_solving,
        s.cultural_fit,
        s.overall_score,
        s.strengths,
        s.weaknesses,
        s.recommendation
      FROM interviews i
      LEFT JOIN interviewers iv ON i.interviewer_id = iv.id
      LEFT JOIN interview_scores s ON i.id = s.interview_id
      WHERE i.candidate_id = $1
      ORDER BY i.interview_date DESC
      `,
      [id]
    );

    const interviews = interviewsResult.rows.map(row => ({
      id: row.id,
      candidate_id: row.candidate_id,
      interviewer_id: row.interviewer_id,
      round: row.round,
      interview_date: row.interview_date,
      duration_minutes: row.duration_minutes,
      status: row.status,
      notes: row.notes,
      interviewer: {
        id: row.interviewer_id,
        name: row.interviewer_name,
        email: row.interviewer_email,
        department: row.interviewer_department,
      },
      score: row.technical_competency ? {
        id: row.id,
        interview_id: row.id,
        technical_competency: row.technical_competency,
        communication_skills: row.communication_skills,
        problem_solving: row.problem_solving,
        cultural_fit: row.cultural_fit,
        overall_score: row.overall_score,
        strengths: row.strengths,
        weaknesses: row.weaknesses,
        recommendation: row.recommendation,
      } : undefined,
    }));

    // Calculate average scores
    const scoresWithData = interviews.filter(i => i.score);
    const averageScores = scoresWithData.length > 0 ? {
      technical_competency: this.average(scoresWithData.map(i => i.score!.technical_competency)),
      communication_skills: this.average(scoresWithData.map(i => i.score!.communication_skills)),
      problem_solving: this.average(scoresWithData.map(i => i.score!.problem_solving)),
      cultural_fit: this.average(scoresWithData.map(i => i.score!.cultural_fit)),
      overall_score: this.average(scoresWithData.map(i => i.score!.overall_score)),
    } : {
      technical_competency: 0,
      communication_skills: 0,
      problem_solving: 0,
      cultural_fit: 0,
      overall_score: 0,
    };

    return {
      ...candidate,
      interviews,
      averageScores,
      totalInterviews: interviews.length,
    };
  }

  async compareCandidates(ids: number[]): Promise<CandidateWithScores[]> {
    return Promise.all(ids.map(id => this.getCandidateById(id)));
  }

  async getRoles(): Promise<string[]> {
    const result = await database.query(
      'SELECT DISTINCT role FROM candidates ORDER BY role'
    );
    return result.rows.map(row => row.role);
  }

  async getRounds(): Promise<string[]> {
    const result = await database.query(
      'SELECT DISTINCT round FROM interviews ORDER BY round'
    );
    return result.rows.map(row => row.round);
  }

  async getInterviewers(): Promise<Array<{ id: number; name: string }>> {
    const result = await database.query(
      'SELECT id, name FROM interviewers ORDER BY name'
    );
    return result.rows;
  }

  async deleteCandidate(id: number): Promise<void> {
    await database.query('DELETE FROM candidates WHERE id = $1', [id]);
  }

  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return Math.round((sum / numbers.length) * 10) / 10;
  }
}

export const candidateService = new CandidateService();
