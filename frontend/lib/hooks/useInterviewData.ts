import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useInterviewStore } from '../store';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useInterviewData() {
  const socketRef = useRef<Socket | null>(null);
  const interviewIdRef = useRef<number | null>(null);
  const { interviewContext, isInterviewActive, ratings } = useInterviewStore();

  useEffect(() => {
    if (!isInterviewActive || !interviewContext) return;

    // Connect socket
    socketRef.current = io(SOCKET_URL);

    // Start interview session
    const experienceYearsMap = {
      junior: 1,
      mid: 4,
      senior: 8,
      lead: 12,
    };

    socketRef.current.emit('interview:start', {
      candidateName: interviewContext.candidateName,
      candidateEmail: interviewContext.candidateEmail,
      candidatePhone: interviewContext.candidatePhone,
      role: interviewContext.role,
      experienceYears: experienceYearsMap[interviewContext.experienceLevel],
      interviewerName: 'AI Interviewer', // You can make this configurable
      interviewerEmail: 'interviewer@company.com',
      round: 'Technical Round 1', // You can make this configurable
    });

    socketRef.current.on('interview:started', (data: { interviewId: number }) => {
      interviewIdRef.current = data.interviewId;
      console.log('Interview session started:', data.interviewId);
    });

    socketRef.current.on('interview:error', (data: { error: string }) => {
      console.error('Interview error:', data.error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isInterviewActive, interviewContext]);

  // Send rating when added
  useEffect(() => {
    if (!socketRef.current || !interviewIdRef.current || ratings.length === 0) return;

    const lastRating = ratings[ratings.length - 1];
    socketRef.current.emit('interview:rating', {
      score: lastRating.score,
      competency: 'Technical', // You can extract this from the rating context
      notes: lastRating.notes,
    });
  }, [ratings]);

  const sendAnalysis = (analysisText: string) => {
    if (socketRef.current && interviewIdRef.current && analysisText) {
      socketRef.current.emit('interview:analysis', { analysisText });
    }
  };

  const completeInterview = (finalNotes?: string) => {
    if (socketRef.current && interviewIdRef.current) {
      socketRef.current.emit('interview:complete', { finalNotes });
      
      socketRef.current.on('interview:completed', (data: any) => {
        console.log('Interview completed:', data);
        // You can show a success message or redirect to comparison dashboard
      });
    }
  };

  return {
    sendAnalysis,
    completeInterview,
    interviewId: interviewIdRef.current,
  };
}
