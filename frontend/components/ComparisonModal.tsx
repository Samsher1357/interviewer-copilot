'use client';

import { Candidate } from '@/lib/api/candidates';
import { X, Trophy, TrendingUp, TrendingDown } from 'lucide-react';

interface ComparisonModalProps {
  candidates: Candidate[];
  onClose: () => void;
}

export default function ComparisonModal({ candidates, onClose }: ComparisonModalProps) {
  if (candidates.length === 0) return null;

  // Calculate modal width based on number of candidates
  const getModalMaxWidth = () => {
    const count = candidates.length;
    if (count <= 2) return 'max-w-3xl';      // ~768px
    if (count === 3) return 'max-w-5xl';     // ~1024px
    if (count === 4) return 'max-w-6xl';     // ~1152px
    if (count === 5) return 'max-w-7xl';     // ~1280px
    return 'max-w-[90vw]';                   // 6+ candidates, use viewport width
  };

  const modalWidth = getModalMaxWidth();

  // Find best scores for highlighting
  const getBestScore = (metric: keyof Candidate['averageScores']) => {
    return Math.max(...candidates.map(c => c.averageScores[metric]));
  };

  const getWorstScore = (metric: keyof Candidate['averageScores']) => {
    return Math.min(...candidates.map(c => c.averageScores[metric]));
  };

  const bestOverall = candidates.reduce((best, current) => 
    current.averageScores.overall_score > best.averageScores.overall_score ? current : best
  );

  const metrics = [
    { key: 'overall_score' as const, label: 'Overall Score' },
    { key: 'technical_competency' as const, label: 'Technical Competency' },
    { key: 'communication_skills' as const, label: 'Communication Skills' },
    { key: 'problem_solving' as const, label: 'Problem Solving' },
    { key: 'cultural_fit' as const, label: 'Cultural Fit' },
  ];

  const getScoreClass = (score: number, metric: keyof Candidate['averageScores']) => {
    const best = getBestScore(metric);
    const worst = getWorstScore(metric);
    
    if (score === best && best !== worst) {
      return 'bg-green-100 text-green-800 font-bold';
    }
    if (score === worst && best !== worst) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-50';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-lg shadow-2xl w-full ${modalWidth} max-h-[90vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-20">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Candidate Comparison</h2>
            <p className="text-sm text-gray-600 mt-1">Comparing {candidates.length} candidates head-to-head</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="flex-1 overflow-auto p-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left p-3 bg-gray-50 font-semibold text-gray-700 sticky left-0 z-10 w-[140px]">
                  Metric
                </th>
                {candidates.map(candidate => (
                  <th key={candidate.id} className="p-3 bg-gray-50 text-center">
                    <div className="flex flex-col items-center gap-2">
                        {candidate.id === bestOverall.id && (
                          <div className="flex items-center gap-1 text-yellow-600">
                            <Trophy size={20} />
                            <span className="text-xs font-semibold">Top Candidate</span>
                          </div>
                        )}
                        <div className="font-bold text-gray-900 break-words">{candidate.name}</div>
                        <div className="text-xs text-gray-600">{candidate.role}</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
              {/* Basic Info */}
              <tr className="border-b border-gray-200">
                <td className="p-3 font-medium text-gray-700 bg-gray-50 sticky left-0 z-10 text-sm">Email</td>
                {candidates.map(c => (
                  <td key={c.id} className="p-3 text-center text-xs text-gray-600 break-all">
                    {c.email}
                  </td>
                ))}
              </tr>
              
              <tr className="border-b border-gray-200">
                <td className="p-3 font-medium text-gray-700 bg-gray-50 sticky left-0 z-10 text-sm">Experience</td>
                {candidates.map(c => (
                  <td key={c.id} className="p-3 text-center text-sm text-gray-600">
                    {c.experience_years || 0} years
                  </td>
                ))}
              </tr>

              <tr className="border-b border-gray-200">
                <td className="p-3 font-medium text-gray-700 bg-gray-50 sticky left-0 z-10 text-sm">Interviews</td>
                {candidates.map(c => (
                  <td key={c.id} className="p-3 text-center text-sm text-gray-600">
                    {c.totalInterviews}
                  </td>
                ))}
              </tr>

              {/* Spacer */}
              <tr className="h-4 bg-gray-100">
                <td colSpan={candidates.length + 1}></td>
              </tr>

              {/* Scores */}
              {metrics.map(metric => (
                <tr key={metric.key} className="border-b border-gray-200">
                  <td className="p-3 font-medium text-gray-700 bg-gray-50 sticky left-0 z-10 text-sm">
                    {metric.label}
                  </td>
                  {candidates.map(c => {
                    const score = c.averageScores[metric.key];
                    const best = getBestScore(metric.key);
                    const worst = getWorstScore(metric.key);
                    const isBest = score === best && best !== worst;
                    const isWorst = score === worst && best !== worst;
                    
                    return (
                      <td key={c.id} className={`p-3 text-center ${getScoreClass(score, metric.key)}`}>
                        <div className="flex items-center justify-center gap-2">
                          {isBest && <TrendingUp size={16} className="text-green-600" />}
                          {isWorst && <TrendingDown size={16} className="text-red-600" />}
                          <span className="text-lg font-semibold">{score.toFixed(1)}</span>
                          <span className="text-sm text-gray-500">/10</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Spacer */}
              <tr className="h-4 bg-gray-100">
                <td colSpan={candidates.length + 1}></td>
              </tr>

              {/* Strengths & Weaknesses */}
              <tr className="border-b border-gray-200">
                <td className="p-3 font-medium text-gray-700 bg-gray-50 sticky left-0 z-10 text-sm">Strengths</td>
                {candidates.map(c => (
                  <td key={c.id} className="p-3 text-xs text-gray-700">
                    {c.interviews[0]?.score?.strengths || 'N/A'}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-gray-200">
                <td className="p-3 font-medium text-gray-700 bg-gray-50 sticky left-0 z-10 text-sm">Weaknesses</td>
                {candidates.map(c => (
                  <td key={c.id} className="p-3 text-xs text-gray-700">
                    {c.interviews[0]?.score?.weaknesses || 'N/A'}
                  </td>
                ))}
              </tr>

              <tr className="border-b border-gray-200">
                <td className="p-3 font-medium text-gray-700 bg-gray-50 sticky left-0 z-10 text-sm">Recommendation</td>
                {candidates.map(c => (
                  <td key={c.id} className="p-3 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      c.interviews[0]?.score?.recommendation?.includes('Strong')
                        ? 'bg-green-100 text-green-800'
                        : c.interviews[0]?.score?.recommendation?.includes('Hire')
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {c.interviews[0]?.score?.recommendation || 'N/A'}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span className="text-gray-600">Best Score</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                <span className="text-gray-600">Lowest Score</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close Comparison
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
