import { Router, Request, Response } from 'express';
import { analyticsService } from '../services/analyticsService';
import type { SessionFilters } from '../services/analyticsService';

const router = Router();

// Get session history
router.get('/sessions', async (req: Request, res: Response) => {
  try {
    const filters: SessionFilters = {
      candidateName: req.query.candidateName as string,
      interviewerName: req.query.interviewerName as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      status: req.query.status as string,
      round: req.query.round as string,
    };

    const sessions = await analyticsService.getSessionHistory(filters);
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching session history:', error);
    res.status(500).json({ error: 'Failed to fetch session history' });
  }
});

// Get interviewer analytics
router.get('/interviewers', async (req: Request, res: Response) => {
  try {
    const interviewerId = req.query.interviewerId ? parseInt(req.query.interviewerId as string) : undefined;
    const stats = await analyticsService.getInterviewerAnalytics(interviewerId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching interviewer analytics:', error);
    res.status(500).json({ error: 'Failed to fetch interviewer analytics' });
  }
});

// Get system stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await analyticsService.getSystemStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ error: 'Failed to fetch system stats' });
  }
});

// Get interview trends
router.get('/trends', async (req: Request, res: Response) => {
  try {
    const trends = await analyticsService.getInterviewTrends();
    res.json(trends);
  } catch (error) {
    console.error('Error fetching interview trends:', error);
    res.status(500).json({ error: 'Failed to fetch interview trends' });
  }
});

export default router;
