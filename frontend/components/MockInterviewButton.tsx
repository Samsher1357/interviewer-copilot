'use client';

import { useState } from 'react';
import { Zap, Loader2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function MockInterviewButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const generateMockInterview = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/mock/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: `Test ${Date.now()}`,
          candidateEmail: `test${Date.now()}@example.com`,
          role: 'Software Engineer',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ Mock interview created! Score: ${data.data.scores.overall_score}/10`);
        setTimeout(() => {
          window.location.reload(); // Refresh to show new data
        }, 1500);
      } else {
        setMessage('❌ Failed to create mock interview');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Error creating mock interview');
    } finally {
      setLoading(false);
    }
  };

  const generateBulkMockInterviews = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/mock/generate-bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 5 }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ Created ${data.data.length} mock interviews!`);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage('❌ Failed to create mock interviews');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Error creating mock interviews');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <button
        onClick={generateMockInterview}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Zap className="w-4 h-4" />
        )}
        Quick Test (1 Interview)
      </button>

      <button
        onClick={generateBulkMockInterviews}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Zap className="w-4 h-4" />
        )}
        Bulk Test (5 Interviews)
      </button>

      {message && (
        <span className="text-sm text-gray-600">{message}</span>
      )}
    </div>
  );
}
