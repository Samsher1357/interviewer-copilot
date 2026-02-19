import { database } from './database';

export interface SessionHistoryItem {
  interview_id: number;
  candidate_name: string;
  candidate_email: string;
  candidate_role: string;
  interviewer_name: string;
  round: string;
  interview_date: Date;
  duration_minutes: number;
  status: string;
  overall_score: number;
  recommendation: string;
}

export interface InterviewerStats {
  interviewer_id: number;
  interviewer_name: string;
  interviewer_email: string;
  total_interviews: number;
  avg_duration_minutes: number;
  avg_score_given: number;
  total_strong_hire: number;
  total_hire: number;
  total_maybe: number;
  total_no_hire: number;
  interviews_this_month: number;
  interviews_this_week: number;
}

export interface SessionFilters {
  candidateName?: string;
  interviewerName?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  round?: string;
}

class AnalyticsService {
  // Get session history with filters
  async getSessionHistory(filters: SessionFilters = {}): Promise<SessionHistoryItem[]> {
    let query = `
      SELECT 
        i.id as interview_id,
        c.name as candidate_name,
        c.email as candidate_email,
        c.role as candidate_role,
        iv.name as interviewer_name,
        i.round,
        i.interview_date,
        i.duration_minutes,
        i.status,
        COALESCE(s.overall_score, 0) as overall_score,
        COALESCE(s.recommendation, 'Pending') as recommendation
      FROM interviews i
      JOIN candidates c ON i.candidate_id = c.id
      JOIN interviewers iv ON i.interviewer_id = iv.id
      LEFT JOIN interview_scores s ON i.id = s.interview_id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (filters.candidateName) {
      query += ` AND c.name ILIKE $${paramIndex}`;
      params.push(`%${filters.candidateName}%`);
      paramIndex++;
    }

    if (filters.interviewerName) {
      query += ` AND iv.name ILIKE $${paramIndex}`;
      params.push(`%${filters.interviewerName}%`);
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

    if (filters.status) {
      query += ` AND i.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.round) {
      query += ` AND i.round = $${paramIndex}`;
      params.push(filters.round);
      paramIndex++;
    }

    query += ' ORDER BY i.interview_date DESC';

    const result = await database.query(query, params);
    return result.rows;
  }

  // Get interviewer analytics
  async getInterviewerAnalytics(interviewerId?: number): Promise<InterviewerStats[]> {
    let query = `
      SELECT 
        iv.id as interviewer_id,
        iv.name as interviewer_name,
        iv.email as interviewer_email,
        COUNT(i.id) as total_interviews,
        ROUND(AVG(i.duration_minutes), 1) as avg_duration_minutes,
        ROUND(AVG(s.overall_score), 2) as avg_score_given,
        COUNT(CASE WHEN s.recommendation = 'Strong Hire' THEN 1 END) as total_strong_hire,
        COUNT(CASE WHEN s.recommendation = 'Hire' THEN 1 END) as total_hire,
        COUNT(CASE WHEN s.recommendation = 'Maybe' THEN 1 END) as total_maybe,
        COUNT(CASE WHEN s.recommendation = 'No Hire' THEN 1 END) as total_no_hire,
        COUNT(CASE WHEN i.interview_date >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as interviews_this_month,
        COUNT(CASE WHEN i.interview_date >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as interviews_this_week
      FROM interviewers iv
      LEFT JOIN interviews i ON iv.id = i.interviewer_id
      LEFT JOIN interview_scores s ON i.id = s.interview_id
    `;

    const params: any[] = [];

    if (interviewerId) {
      query += ' WHERE iv.id = $1';
      params.push(interviewerId);
    }

    query += ' GROUP BY iv.id, iv.name, iv.email ORDER BY total_interviews DESC';

    const result = await database.query(query, params);
    return result.rows;
  }

  // Get overall system stats
  async getSystemStats(): Promise<any> {
    const result = await database.query(`
      SELECT 
        COUNT(DISTINCT c.id) as total_candidates,
        COUNT(DISTINCT i.id) as total_interviews,
        COUNT(DISTINCT iv.id) as total_interviewers,
        ROUND(AVG(s.overall_score), 2) as avg_overall_score,
        COUNT(CASE WHEN i.status = 'completed' THEN 1 END) as completed_interviews,
        COUNT(CASE WHEN i.status = 'in_progress' THEN 1 END) as in_progress_interviews,
        COUNT(CASE WHEN s.recommendation = 'Strong Hire' THEN 1 END) as total_strong_hires,
        COUNT(CASE WHEN s.recommendation = 'Hire' THEN 1 END) as total_hires
      FROM candidates c
      LEFT JOIN interviews i ON c.id = i.candidate_id
      LEFT JOIN interviewers iv ON i.interviewer_id = iv.id
      LEFT JOIN interview_scores s ON i.id = s.interview_id
    `);

    return result.rows[0];
  }

  // Get interview trends (last 30 days)
  async getInterviewTrends(): Promise<any[]> {
    const result = await database.query(`
      SELECT 
        DATE(i.interview_date) as date,
        COUNT(i.id) as interview_count,
        ROUND(AVG(s.overall_score), 2) as avg_score
      FROM interviews i
      LEFT JOIN interview_scores s ON i.id = s.interview_id
      WHERE i.interview_date >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(i.interview_date)
      ORDER BY date DESC
    `);

    return result.rows;
  }
}

export const analyticsService = new AnalyticsService();
