const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface CandidateFilters {
  role?: string;
  round?: string;
  interviewer?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}

export interface AverageScores {
  technical_competency: number;
  communication_skills: number;
  problem_solving: number;
  cultural_fit: number;
  overall_score: number;
}

export interface InterviewScore {
  technical_competency: number;
  communication_skills: number;
  problem_solving: number;
  cultural_fit: number;
  overall_score: number;
  strengths?: string;
  weaknesses?: string;
  recommendation?: string;
}

export interface Interview {
  id: number;
  round: string;
  interview_date: string;
  interviewer: {
    name: string;
    department?: string;
  };
  score?: InterviewScore;
}

export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  experience_years?: number;
  status: string;
  interviews: Interview[];
  averageScores: AverageScores;
  totalInterviews: number;
}

export interface FilterOptions {
  roles: string[];
  rounds: string[];
  interviewers: Array<{ id: number; name: string }>;
}

export async function getCandidates(filters?: CandidateFilters): Promise<Candidate[]> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }

  const url = `${API_BASE}/api/candidates${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch candidates');
  }
  
  return response.json();
}

export async function getCandidate(id: number): Promise<Candidate> {
  const response = await fetch(`${API_BASE}/api/candidates/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch candidate');
  }
  
  return response.json();
}

export async function compareCandidates(ids: number[]): Promise<Candidate[]> {
  const response = await fetch(`${API_BASE}/api/candidates/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to compare candidates');
  }
  
  return response.json();
}

export async function getFilterOptions(): Promise<FilterOptions> {
  const response = await fetch(`${API_BASE}/api/candidates/filters/options`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch filter options');
  }
  
  return response.json();
}

export function exportCandidatesCSV(filters?: CandidateFilters): string {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
  }

  return `${API_BASE}/api/candidates/export/csv${params.toString() ? `?${params}` : ''}`;
}

export async function deleteCandidate(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/api/candidates/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete candidate');
  }
}
