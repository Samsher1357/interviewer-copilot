'use client';

import { useState, useEffect } from 'react';
import { getSessionHistory, getInterviewerAnalytics, getSystemStats, SessionHistoryItem, InterviewerStats, SystemStats, SessionFilters } from '@/lib/api/analytics';
import { Users, Calendar, TrendingUp, Award, Clock, Filter, ChevronDown, ChevronUp } from 'lucide-react';

export default function AnalyticsDashboard() {
  const [sessions, setSessions] = useState<SessionHistoryItem[]>([]);
  const [interviewers, setInterviewers] = useState<InterviewerStats[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'sessions' | 'interviewers'>('sessions');
  
  const [filters, setFilters] = useState<SessionFilters>({
    candidateName: '',
    interviewerName: '',
    dateFrom: '',
    dateTo: '',
    status: '',
    round: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sessionsData, interviewersData, statsData] = await Promise.all([
        getSessionHistory(filters),
        getInterviewerAnalytics(),
        getSystemStats(),
      ]);
      
      setSessions(sessionsData);
      setInterviewers(interviewersData);
      setSystemStats(statsData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    loadData();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      candidateName: '',
      interviewerName: '',
      dateFrom: '',
      dateTo: '',
      status: '',
      round: '',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRecommendationBadge = (recommendation: string) => {
    const colors: Record<string, string> = {
      'Strong Hire': 'bg-green-100 text-green-800',
      'Hire': 'bg-blue-100 text-blue-800',
      'Maybe': 'bg-yellow-100 text-yellow-800',
      'No Hire': 'bg-red-100 text-red-800',
      'Pending': 'bg-gray-100 text-gray-800',
    };
    return colors[recommendation] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Session history and interviewer performance metrics</p>
        </div>

        {/* System Stats Cards */}
        {systemStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Interviews</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats.total_interviews || 0}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Candidates</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats.total_candidates || 0}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {systemStats.avg_overall_score ? Number(systemStats.avg_overall_score).toFixed(1) : 'N/A'}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Strong Hires</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats.total_strong_hires || 0}</p>
                </div>
                <Award className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('sessions')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'sessions'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Session History
              </button>
              <button
                onClick={() => setActiveTab('interviewers')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'interviewers'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Interviewer Analytics
              </button>
            </div>
          </div>

          {/* Filters */}
          {activeTab === 'sessions' && (
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Filter size={18} />
                Filters
                {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {showFilters && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    placeholder="Candidate name"
                    value={filters.candidateName}
                    onChange={(e) => setFilters({ ...filters, candidateName: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Interviewer name"
                    value={filters.interviewerName}
                    onChange={(e) => setFilters({ ...filters, interviewerName: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="in_progress">In Progress</option>
                  </select>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="From date"
                  />
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="To date"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={applyFilters}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Apply
                    </button>
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
              </div>
            ) : activeTab === 'sessions' ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Candidate</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Interviewer</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Round</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Duration</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Score</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => (
                      <tr key={session.interview_id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{session.candidate_name}</p>
                            <p className="text-xs text-gray-500">{session.candidate_email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">{session.candidate_role}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{session.interviewer_name}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{session.round}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {new Date(session.interview_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            {session.duration_minutes || 0} min
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-sm font-semibold ${getScoreColor(session.overall_score || 0)}`}>
                            {session.overall_score ? Number(session.overall_score).toFixed(1) : 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRecommendationBadge(session.recommendation)}`}>
                            {session.recommendation}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {sessions.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No sessions found
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {interviewers.map((interviewer) => (
                  <div key={interviewer.interviewer_id} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{interviewer.interviewer_name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{interviewer.interviewer_email}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-600">Total Interviews</p>
                        <p className="text-xl font-bold text-gray-900">{interviewer.total_interviews}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Avg Score Given</p>
                        <p className="text-xl font-bold text-gray-900">
                          {interviewer.avg_score_given ? Number(interviewer.avg_score_given).toFixed(1) : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Avg Duration</p>
                        <p className="text-xl font-bold text-gray-900">
                          {interviewer.avg_duration_minutes ? Number(interviewer.avg_duration_minutes).toFixed(0) : 0} min
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">This Week</p>
                        <p className="text-xl font-bold text-gray-900">{interviewer.interviews_this_week}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-600 mb-2">Recommendations</p>
                      <div className="flex gap-2 flex-wrap">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          Strong Hire: {interviewer.total_strong_hire}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          Hire: {interviewer.total_hire}
                        </span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                          Maybe: {interviewer.total_maybe}
                        </span>
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                          No Hire: {interviewer.total_no_hire}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {interviewers.length === 0 && (
                  <div className="col-span-2 text-center py-12 text-gray-500">
                    No interviewer data found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
