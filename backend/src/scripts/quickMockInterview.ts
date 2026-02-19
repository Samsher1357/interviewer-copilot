import { interviewDataService } from '../services/interviewDataService';
import { database } from '../services/database';

async function quickMockInterview() {
  console.log('⚡ Quick Mock Interview Generator\n');

  try {
    await database.connect();

    const name = `Test Candidate ${Date.now()}`;
    const email = `test${Date.now()}@example.com`;
    const role = 'Software Engineer';

    console.log(`Creating interview for: ${name}`);

    const interviewId = await interviewDataService.startInterview({
      candidateName: name,
      candidateEmail: email,
      candidatePhone: '+91-9876543210',
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
    const analysisTexts = [`**Strengths:** Strong technical skills\n**Concerns:** None`];
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

    console.log(`✅ Mock interview created!`);
    console.log(`   ID: ${interviewId}`);
    console.log(`   Name: ${name}`);
    console.log(`   Email: ${email}`);
    console.log(`   Overall Score: ${scores.overall_score}/10`);
    console.log(`   Recommendation: ${recommendation}\n`);
    console.log(`💡 Visit http://localhost:3000/comparison to see it!\n`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await database.disconnect();
  }
}

quickMockInterview();
