import { Router, Request, Response } from 'express';
import { candidateService } from '../services/candidateService';
import { CandidateFilters } from '../types/candidate';
import { pdfService } from '../services/pdfService';

const router = Router();

// Get all candidates with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const filters: CandidateFilters = {
      role: req.query.role as string,
      round: req.query.round as string,
      interviewer: req.query.interviewer as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      status: req.query.status as string,
    };

    const candidates = await candidateService.getCandidates(filters);
    res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

// Get single candidate by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid candidate ID' });
    }

    const candidate = await candidateService.getCandidateById(id);
    res.json(candidate);
  } catch (error: any) {
    console.error('Error fetching candidate:', error);
    if (error.message === 'Candidate not found') {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
});

// Compare multiple candidates
router.post('/compare', async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid candidate IDs' });
    }

    const candidates = await candidateService.compareCandidates(ids);
    res.json(candidates);
  } catch (error) {
    console.error('Error comparing candidates:', error);
    res.status(500).json({ error: 'Failed to compare candidates' });
  }
});

// Get available filter options
router.get('/filters/options', async (req: Request, res: Response) => {
  try {
    const [roles, rounds, interviewers] = await Promise.all([
      candidateService.getRoles(),
      candidateService.getRounds(),
      candidateService.getInterviewers(),
    ]);

    res.json({ roles, rounds, interviewers });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ error: 'Failed to fetch filter options' });
  }
});

// Export candidates as CSV
router.get('/export/csv', async (req: Request, res: Response) => {
  try {
    const filters: CandidateFilters = {
      role: req.query.role as string,
      round: req.query.round as string,
      interviewer: req.query.interviewer as string,
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      status: req.query.status as string,
    };

    const candidates = await candidateService.getCandidates(filters);

    // Generate CSV
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

    const rows = candidates.map(c => [
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

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=candidates-comparison.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting candidates:', error);
    res.status(500).json({ error: 'Failed to export candidates' });
  }
});

// Generate PDF report for candidate
router.get('/:id/report', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid candidate ID' });
    }

    const candidate = await candidateService.getCandidateById(id);
    const doc = pdfService.generateCandidateReport(candidate);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=interview-report-${candidate.name.replace(/\s+/g, '-')}.pdf`);
    
    doc.pipe(res);
  } catch (error: any) {
    console.error('Error generating PDF report:', error);
    if (error.message === 'Candidate not found') {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.status(500).json({ error: 'Failed to generate PDF report' });
  }
});

// Delete candidate
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid candidate ID' });
    }

    await candidateService.deleteCandidate(id);
    res.json({ success: true, message: 'Candidate deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});

export default router;
