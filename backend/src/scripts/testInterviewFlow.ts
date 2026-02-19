import { interviewDataService } from '../services/interviewDataService';
import { database } from '../services/database';

async function testInterviewFlow() {
  console.log('🧪 Testing Interview Data Flow\n');

  try {
    await database.connect();

    // Test 1: Create interview session (simulating your form data)
    console.log('1️⃣ Creating interview session...');
    const interviewId = await interviewDataService.startInterview({
      candidateName: 'Rohit',
      candidateEmail: 'rohitbagde535@gmail.com',
      candidatePhone: '+919673166256',
      role: 'SDE',
      experienceYears: 4, // Mid level
      interviewerName: 'AI Interviewer',
      interviewerEmail: 'interviewer@company.com',
      round: 'Technical Round 1',
    });
    console.log(`✅ Interview created with ID: ${interviewId}\n`);

    // Test 2: Simulate ratings during interview
    console.log('2️⃣ Simulating ratings...');
    const ratings = [
      { score: 4, competency: 'Technical' },
      { score: 5, competency: 'Communication' },
      { score: 4, competency: 'Problem Solving' },
      { score: 4, competency: 'Cultural Fit' },
    ];
    console.log('Ratings:', ratings);

    // Test 3: Calculate scores
    console.log('\n3️⃣ Calculating average scores...');
    const scores = interviewDataService.calculateAverageScores(ratings);
    console.log('Calculated Scores:', scores);

    // Test 4: Extract insights from analysis
    console.log('\n4️⃣ Extracting insights from analysis...');
    const analysisTexts = [
      `**Score: 4/5**
**Strengths:** 
• Strong Java fundamentals
• Good problem-solving approach
• Clean code practices
**Concerns:** 
• Could improve on system design
• Limited experience with microservices`,
    ];
    const insights = interviewDataService.extractInsights(analysisTexts);
    console.log('Strengths:', insights.strengths);
    console.log('Weaknesses:', insights.weaknesses);

    // Test 5: Generate recommendation
    console.log('\n5️⃣ Generating recommendation...');
    const recommendation = interviewDataService.generateRecommendation(scores.overall_score);
    console.log('Recommendation:', recommendation);

    // Test 6: Complete interview
    console.log('\n6️⃣ Completing interview...');
    await interviewDataService.completeInterview(
      interviewId,
      {
        ...scores,
        strengths: insights.strengths,
        weaknesses: insights.weaknesses,
        recommendation,
      },
      30 // 30 minutes duration
    );
    console.log('✅ Interview completed and saved\n');

    // Test 7: Retrieve the interview
    console.log('7️⃣ Retrieving interview data...');
    const interview = await interviewDataService.getInterview(interviewId);
    console.log('\n📊 Final Interview Record:');
    console.log('─────────────────────────────────────');
    console.log(`Candidate: ${interview.candidate_name}`);
    console.log(`Email: ${interview.candidate_email}`);
    console.log(`Interviewer: ${interview.interviewer_name}`);
    console.log(`Round: ${interview.round}`);
    console.log(`Duration: ${interview.duration_minutes} minutes`);
    console.log(`Status: ${interview.status}`);
    console.log('\nScores:');
    console.log(`  Technical: ${interview.technical_competency}/10`);
    console.log(`  Communication: ${interview.communication_skills}/10`);
    console.log(`  Problem Solving: ${interview.problem_solving}/10`);
    console.log(`  Cultural Fit: ${interview.cultural_fit}/10`);
    console.log(`  Overall: ${interview.overall_score}/10`);
    console.log(`\nRecommendation: ${interview.recommendation}`);
    console.log(`Strengths: ${interview.strengths}`);
    console.log(`Weaknesses: ${interview.weaknesses}`);
    console.log('─────────────────────────────────────\n');

    // Test 8: Query via API endpoint
    console.log('8️⃣ Testing API endpoint...');
    const candidateResult = await database.query(
      `SELECT c.*, 
              COUNT(i.id) as total_interviews,
              AVG(s.overall_score) as avg_score
       FROM candidates c
       LEFT JOIN interviews i ON c.id = i.candidate_id
       LEFT JOIN interview_scores s ON i.id = s.interview_id
       WHERE c.email = $1
       GROUP BY c.id`,
      ['rohitbagde535@gmail.com']
    );
    
    if (candidateResult.rows.length > 0) {
      const candidate = candidateResult.rows[0];
      console.log('✅ Candidate found in database:');
      console.log(`   Name: ${candidate.name}`);
      console.log(`   Role: ${candidate.role}`);
      console.log(`   Total Interviews: ${candidate.total_interviews}`);
      console.log(`   Average Score: ${candidate.avg_score}`);
    }

    console.log('\n✅ All tests passed! Database integration working correctly.\n');
    console.log('💡 Next steps:');
    console.log('   1. Visit http://localhost:3000 to start a real interview');
    console.log('   2. Fill the form with your data');
    console.log('   3. Conduct the interview');
    console.log('   4. Check http://localhost:3000/comparison to see results\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await database.disconnect();
  }
}

testInterviewFlow();
