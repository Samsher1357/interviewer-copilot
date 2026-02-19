import PDFDocument from 'pdfkit';
import { CandidateWithScores } from '../types/candidate';

export class PDFService {
  generateCandidateReport(candidate: CandidateWithScores): PDFKit.PDFDocument {
    const doc = new PDFDocument({ margin: 50 });

    // Header
    doc.fontSize(24).text('Interview Feedback Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // Candidate Info
    doc.fontSize(16).text('Candidate Information', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`Name: ${candidate.name}`);
    doc.text(`Email: ${candidate.email}`);
    if (candidate.phone) doc.text(`Phone: ${candidate.phone}`);
    if (candidate.experience_years) doc.text(`Experience: ${candidate.experience_years} years`);
    doc.text(`Role: ${candidate.role}`);
    doc.moveDown(2);

    // Overall Score
    doc.fontSize(16).text('Overall Performance', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(20);
    const overallScore = candidate.averageScores?.overall_score || 0;
    const scoreColor = overallScore >= 8 ? 'green' : overallScore >= 6 ? 'orange' : 'red';
    doc.fillColor(scoreColor).text(`${overallScore.toFixed(1)} / 10`, { align: 'center' });
    doc.fillColor('black');
    doc.moveDown(2);

    // Detailed Scores
    doc.fontSize(16).text('Detailed Scores', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    
    const scores = [
      { label: 'Technical Competency', value: candidate.averageScores?.technical_competency },
      { label: 'Communication Skills', value: candidate.averageScores?.communication_skills },
      { label: 'Problem Solving', value: candidate.averageScores?.problem_solving },
      { label: 'Cultural Fit', value: candidate.averageScores?.cultural_fit }
    ];

    scores.forEach(score => {
      const value = score.value || 0;
      doc.text(`${score.label}: ${value.toFixed(1)} / 10`);
    });
    doc.moveDown(2);

    // Get latest interview score for strengths/weaknesses
    const latestInterview = candidate.interviews[0];
    const latestScore = latestInterview?.score;

    // Strengths
    if (latestScore?.strengths) {
      doc.fontSize(16).text('Key Strengths', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);
      doc.text(latestScore.strengths, { align: 'justify' });
      doc.moveDown(2);
    }

    // Weaknesses
    if (latestScore?.weaknesses) {
      doc.fontSize(16).text('Areas for Improvement', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);
      doc.text(latestScore.weaknesses, { align: 'justify' });
      doc.moveDown(2);
    }

    // Recommendation
    if (latestScore?.recommendation) {
      doc.fontSize(16).text('Hiring Recommendation', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(14).fillColor('blue').text(latestScore.recommendation, { align: 'center' });
      doc.fillColor('black');
      doc.moveDown(2);
    }

    // Interview Details
    if (candidate.interviews && candidate.interviews.length > 0) {
      doc.addPage();
      doc.fontSize(16).text('Interview Sessions', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);

      candidate.interviews.forEach((interview, index) => {
        doc.text(`Session ${index + 1}:`);
        doc.text(`  Date: ${new Date(interview.interview_date).toLocaleDateString()}`);
        doc.text(`  Round: ${interview.round}`);
        doc.text(`  Interviewer: ${interview.interviewer.name}`);
        if (interview.duration_minutes) {
          doc.text(`  Duration: ${interview.duration_minutes} minutes`);
        }
        doc.moveDown(1);
      });
    }

    // Footer
    doc.fontSize(10).text('This is a confidential document. Please handle with care.', 
      50, doc.page.height - 50, { align: 'center' });

    doc.end();
    return doc;
  }
}

export const pdfService = new PDFService();
