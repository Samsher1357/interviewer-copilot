'use client';

import { Candidate } from '@/lib/api/candidates';
import { Check, Mail, Phone, Briefcase, Calendar, Trash2, FileDown } from 'lucide-react';

interface CandidateCardProps {
  candidate: Candidate;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function CandidateCard({ candidate, isSelected, onToggleSelect, onDelete }: CandidateCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleDownloadPDF = () => {
    window.open(`http://localhost:3001/api/candidates/${candidate.id}/report`, '_blank');
  };

  return (
    <div
      onClick={() => onToggleSelect(candidate.id)}
      className={`bg-white rounded-lg shadow-sm border-2 transition-all cursor-pointer ${
        isSelected ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' : 'border-transparent hover:border-gray-200 hover:shadow-md'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              <Briefcase size={14} />
              <span>{candidate.role}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadPDF();
              }}
              className="p-2 rounded-lg transition-colors bg-blue-50 text-blue-600 hover:bg-blue-100"
              title="Download PDF Report"
            >
              <FileDown size={18} />
            </button>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(candidate.id);
                }}
                className="p-2 rounded-lg transition-colors bg-red-50 text-red-600 hover:bg-red-100"
                title="Delete candidate"
              >
                <Trash2 size={18} />
              </button>
            )}
            <div
              className={`p-2 rounded-lg transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <Check size={18} />
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail size={14} />
            <span className="truncate">{candidate.email}</span>
          </div>
          {candidate.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone size={14} />
              <span>{candidate.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={14} />
            <span>{candidate.totalInterviews} interview{candidate.totalInterviews !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Overall Score */}
      <div className="p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Overall Score</span>
          <div className={`px-3 py-1 rounded-full font-bold text-lg ${getScoreColor(candidate.averageScores?.overall_score || 0)}`}>
            {candidate.averageScores?.overall_score?.toFixed(1) || 'N/A'}
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="p-4 space-y-3">
        <ScoreBar
          label="Technical"
          score={candidate.averageScores?.technical_competency || 0}
          color={getScoreBadge(candidate.averageScores?.technical_competency || 0)}
        />
        <ScoreBar
          label="Communication"
          score={candidate.averageScores?.communication_skills || 0}
          color={getScoreBadge(candidate.averageScores?.communication_skills || 0)}
        />
        <ScoreBar
          label="Problem Solving"
          score={candidate.averageScores?.problem_solving || 0}
          color={getScoreBadge(candidate.averageScores?.problem_solving || 0)}
        />
        <ScoreBar
          label="Cultural Fit"
          score={candidate.averageScores?.cultural_fit || 0}
          color={getScoreBadge(candidate.averageScores?.cultural_fit || 0)}
        />
      </div>

      {/* Strengths & Weaknesses */}
      {candidate.interviews.length > 0 && candidate.interviews[0].score && (
        <div className="p-4 border-t border-gray-100 space-y-3">
          {candidate.interviews[0].score.strengths && (
            <div>
              <h4 className="text-xs font-semibold text-green-700 uppercase mb-1">Strengths</h4>
              <p className="text-sm text-gray-700 line-clamp-2">{candidate.interviews[0].score.strengths}</p>
            </div>
          )}
          {candidate.interviews[0].score.weaknesses && (
            <div>
              <h4 className="text-xs font-semibold text-red-700 uppercase mb-1">Weaknesses</h4>
              <p className="text-sm text-gray-700 line-clamp-2">{candidate.interviews[0].score.weaknesses}</p>
            </div>
          )}
          {candidate.interviews[0].score.recommendation && (
            <div className="pt-2 border-t border-gray-100">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                candidate.interviews[0].score.recommendation.includes('Strong')
                  ? 'bg-green-100 text-green-800'
                  : candidate.interviews[0].score.recommendation.includes('Hire')
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {candidate.interviews[0].score.recommendation}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className="text-xs font-semibold text-gray-900">{score.toFixed(1)}/10</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${color} transition-all`}
          style={{ width: `${(score / 10) * 100}%` }}
        />
      </div>
    </div>
  );
}
