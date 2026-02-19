const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface SessionHistoryItem {
  interview_id: number;
  candidate_name: string;
  candidate_email: string;
  candidate_role: string;
  interviewer_name: string;
  round: string;
  interview_date: string;
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

export interface SystemStats {
  total_candidates: number;
  total_interviews: number;
  total_interviewers: number;
  avg_overall_score: number;
  completed_interviews: number;
  in_progress_interviews: number;
  total_strong_hires: number;
  total_hires: number;
}

export interface InterviewTrend {
  date: string;
  interview_count: number;
  avg_score: number;
}

export interface SessionFilters {
  candidateName?: string;
  interviewerName?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  round?: string;
}

export async function getSessionHistory(filters?: SessionFilters): Promise<SessionHistoryItem[]> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }

  const url = `${API_BASE}/api/analytics/sessions${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch session history');
  }
  
  return response.json();
}

export async function getInterviewerAnalytics(interviewerId?: number): Promise<InterviewerStats[]> {
  const params = new URLSearchParams();
  if (interviewerId) {
    params.append('interviewerId', interviewerId.toString());
  }

  const url = `${API_BASE}/api/analytics/interviewers${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch interviewer analytics');
  }
  
  return response.json();
}

export async function getSystemStats(): Promise<SystemStats> {
  const response = await fetch(`${API_BASE}/api/analytics/stats`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch system stats');
  }
  
  return response.json();
}

export async function getInterviewTrends(): Promise<InterviewTrend[]> {
  const response = await fetch(`${API_BASE}/api/analytics/trends`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch interview trends');
  }
  
  return response.json();
}
