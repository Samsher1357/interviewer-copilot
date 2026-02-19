import { Router, Request, Response } from 'express';
import { interviewDataService } from '../services/interviewDataService';

const router = Router();

// Mock interview data generator
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { candidateName, candidateEmail, role } = req.body;

    // Use provided data or generate random
    const name = candidateName || `Test Candidate ${Date.now()}`;
    const email = candidateEmail || `test${Date.now()}@example.com`;
    const jobRole = role || 'Software Engineer';

    // Start interview
    const interviewId = await interviewDataService.startInterview({
      candidateName: name,
      candidateEmail: email,
      candidatePhone: '+91-9876543210',
      role: jobRole,
      experienceYears: Math.floor(Math.random() * 10) + 1,
      interviewerName: 'AI Interviewer',
      interviewerEmail: 'interviewer@company.com',
      round: 'Technical Round 1',
    });

    // Generate random but realistic ratings
    const ratings = [
      { score: Math.floor(Math.random() * 3) + 3, competency: 'Technical' }, // 3-5
      { score: Math.floor(Math.random() * 3) + 3, competency: 'Communication' }, // 3-5
      { score: Math.floor(Math.random() * 3) + 3, competency: 'Problem Solving' }, // 3-5
      { score: Math.floor(Math.random() * 3) + 3, competency: 'Cultural Fit' }, // 3-5
    ];

    // Calculate scores
    const scores = interviewDataService.calculateAverageScores(ratings);

    // Generate mock analysis texts
    const analysisTexts = [
      `**Score: ${ratings[0].score}/5**
**Strengths:** 
• Strong technical fundamentals
• Good problem-solving approach
• Clean code practices
**Concerns:** 
• Could improve on system design
• Limited experience with distributed systems`,
    ];

    const insights = interviewDataService.extractInsights(analysisTexts);
    const recommendation = interviewDataService.generateRecommendation(scores.overall_score);

    // Complete interview
    await interviewDataService.completeInterview(
      interviewId,
      {
        ...scores,
        strengths: insights.strengths,
        weaknesses: insights.weaknesses,
        recommendation,
      },
      Math.floor(Math.random() * 30) + 20 // 20-50 minutes
    );

    res.json({
      success: true,
      message: 'Mock interview generated successfully',
      data: {
        interviewId,
        candidateName: name,
        candidateEmail: email,
        role: jobRole,
        scores,
        recommendation,
      },
    });
  } catch (error: any) {
    console.error('Error generating mock interview:', error);
    res.status(500).json({ error: 'Failed to generate mock interview', details: error.message });
  }
});

// Generate multiple mock interviews at once
router.post('/generate-bulk', async (req: Request, res: Response) => {
  try {
    const { count = 5 } = req.body;
    const results = [];

    const roles = ['Software Engineer', 'Senior Developer', 'Tech Lead', 'Frontend Developer', 'Backend Developer'];
    const names = ['Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Rohan', 'Neha'];

    for (let i = 0; i < count; i++) {
      const name = names[Math.floor(Math.random() * names.length)] + ` ${Date.now() + i}`;
      const email = `test${Date.now() + i}@example.com`;
      const role = roles[Math.floor(Math.random() * roles.length)];

      const interviewId = await interviewDataService.startInterview({
        candidateName: name,
        candidateEmail: email,
        candidatePhone: `+91-98765${String(43210 + i).slice(-5)}`,
        role,
        experienceYears: Math.floor(Math.random() * 10) + 1,
        interviewerName: 'AI Interviewer',
        interviewerEmail: 'interviewer@company.com',
        round: 'Technical Round 1',
      });

      const ratings = [
        { score: Math.floor(Math.random() * 3) + 3, competency: 'Technical' },
        { score: Math.floor(Math.random() * 3) + 3, competency: 'Communication' },
        { score: Math.floor(Math.random() * 3) + 3, competency: 'Problem Solving' },
        { score: Math.floor(Math.random() * 3) + 3, competency: 'Cultural Fit' },
      ];

      const scores = interviewDataService.calculateAverageScores(ratings);
      const analysisTexts = [`**Strengths:** Good technical skills\n**Concerns:** None significant`];
      const insights = interviewDataService.extractInsights(analysisTexts);
      const recommendation = interviewDataService.generateRecommendation(scores.overall_score);

      await interviewDataService.completeInterview(
        interviewId,
        {
          ...scores,
          strengths: insights.strengths || 'Strong technical skills',
          weaknesses: insights.weaknesses || 'None significant',
          recommendation,
        },
        Math.floor(Math.random() * 30) + 20
      );

      results.push({ name, email, role, scores: scores.overall_score });
    }

    res.json({
      success: true,
      message: `Generated ${count} mock interviews`,
      data: results,
    });
  } catch (error: any) {
    console.error('Error generating bulk mock interviews:', error);
    res.status(500).json({ error: 'Failed to generate bulk interviews', details: error.message });
  }
});

export default router;
