'use client';

import { useState, useEffect } from 'react';
import { getCandidates, getFilterOptions, exportCandidatesCSV, deleteCandidate, Candidate, CandidateFilters, FilterOptions } from '@/lib/api/candidates';
import { Filter, Download, X, ChevronDown, ChevronUp, GitCompare } from 'lucide-react';
import CandidateCard from './CandidateCard';
import MockInterviewButton from './MockInterviewButton';
import ComparisonModal from './ComparisonModal';

export default function ComparisonDashboard() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [sortBy, setSortBy] = useState<'overall' | 'technical' | 'communication' | 'name'>('overall');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [filters, setFilters] = useState<CandidateFilters>({
    role: '',
    round: '',
    interviewer: '',
    dateFrom: '',
    dateTo: '',
    status: 'active',
  });

  useEffect(() => {
    loadFilterOptions();
    loadCandidates();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const options = await getFilterOptions();
      setFilterOptions(options);
    } catch (error) {
      console.error('Failed to load filter options:', error);
    }
  };

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const data = await getCandidates(filters);
      setCandidates(data);
    } catch (error) {
      console.error('Failed to load candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof CandidateFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    loadCandidates();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      role: '',
      round: '',
      interviewer: '',
      dateFrom: '',
      dateTo: '',
      status: 'active',
    });
  };

  const toggleCandidateSelection = (id: number) => {
    setSelectedCandidates(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    // If candidates are selected, export only those
    if (selectedCandidates.length > 0) {
      const selectedData = candidates.filter(c => selectedCandidates.includes(c.id));
      exportSelectedCandidates(selectedData);
    } else {
      // Export all with current filters
      const url = exportCandidatesCSV(filters);
      window.open(url, '_blank');
    }
  };

  const exportSelectedCandidates = (selectedData: Candidate[]) => {
    const headers = [
      'Name',
      'Email',
      'Role',
      'Experience (Years)',
      'Total Interviews',
      'Avg Technical',
      'Avg Communication',
      'Avg Problem Solving',
      'Avg Cultural Fit',
      'Avg Overall Score',
      'Status'
    ];

    const rows = selectedData.map(c => [
      c.name,
      c.email,
      c.role,
      c.experience_years || 0,
      c.totalInterviews,
      c.averageScores.technical_competency,
      c.averageScores.communication_skills,
      c.averageScores.problem_solving,
      c.averageScores.cultural_fit,
      c.averageScores.overall_score,
      c.status
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selected-candidates-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this candidate? This will also delete all their interviews and scores.')) {
      return;
    }

    try {
      await deleteCandidate(id);
      // Refresh the list
      loadCandidates();
      // Remove from selection if selected
      setSelectedCandidates(prev => prev.filter(cid => cid !== id));
    } catch (error) {
      console.error('Failed to delete candidate:', error);
      alert('Failed to delete candidate. Please try again.');
    }
  };

  const sortedCandidates = [...candidates].sort((a, b) => {
    let aVal, bVal;
    
    switch (sortBy) {
      case 'overall':
        aVal = a.averageScores.overall_score;
        bVal = b.averageScores.overall_score;
        break;
      case 'technical':
        aVal = a.averageScores.technical_competency;
        bVal = b.averageScores.technical_competency;
        break;
      case 'communication':
        aVal = a.averageScores.communication_skills;
        bVal = b.averageScores.communication_skills;
        break;
      case 'name':
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      default:
        aVal = a.averageScores.overall_score;
        bVal = b.averageScores.overall_score;
    }
    
    return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const displayedCandidates = sortedCandidates;

  const selectedCandidatesData = candidates.filter(c => selectedCandidates.includes(c.id));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidate Comparison Dashboard</h1>
              <p className="text-gray-600">Compare candidates side-by-side to make informed hiring decisions</p>
            </div>
            <MockInterviewButton />
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Filter size={18} />
                Filters
                {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download size={18} />
                Export CSV {selectedCandidates.length > 0 && `(${selectedCandidates.length})`}
              </button>

              {selectedCandidates.length >= 2 && (
                <button
                  onClick={() => setShowComparisonModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <GitCompare size={18} />
                  Compare Selected ({selectedCandidates.length})
                </button>
              )}

              {selectedCandidates.length > 0 && (
                <button
                  onClick={() => setSelectedCandidates([])}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  <X size={18} />
                  Clear Selection ({selectedCandidates.length})
                </button>
              )}
            </div>

            <div className="flex gap-2 items-center">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="overall">Overall Score</option>
                <option value="technical">Technical</option>
                <option value="communication">Communication</option>
                <option value="name">Name</option>
              </select>
              
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && filterOptions && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={filters.role}
                    onChange={(e) => handleFilterChange('role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">All Roles</option>
                    {filterOptions.roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Round</label>
                  <select
                    value={filters.round}
                    onChange={(e) => handleFilterChange('round', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">All Rounds</option>
                    {filterOptions.rounds.map(round => (
                      <option key={round} value={round}>{round}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interviewer</label>
                  <select
                    value={filters.interviewer}
                    onChange={(e) => handleFilterChange('interviewer', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">All Interviewers</option>
                    {filterOptions.interviewers.map(interviewer => (
                      <option key={interviewer.id} value={interviewer.name}>{interviewer.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Apply Filters
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

        {/* Candidates Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading candidates...</p>
          </div>
        ) : displayedCandidates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-600">No candidates found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedCandidates.map(candidate => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                isSelected={selectedCandidates.includes(candidate.id)}
                onToggleSelect={toggleCandidateSelection}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Comparison Modal */}
      {showComparisonModal && (
        <ComparisonModal
          candidates={selectedCandidatesData}
          onClose={() => setShowComparisonModal(false)}
        />
      )}
    </div>
  );
}
