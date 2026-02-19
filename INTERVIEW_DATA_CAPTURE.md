# Interview Data Capture Integration

## Overview
This document explains how interview data is captured in real-time and stored in the database for the comparison dashboard.

## Data Flow

### 1. Interview Setup (SetupScreen)
**Collected Data:**
- Candidate name
- Candidate email (required)
- Candidate phone (optional)
- Role
- Experience level (converted to years: junior=1, mid=4, senior=8, lead=12)
- Required skills
- Company
- Job description

**Action:** When user clicks "Start Interview", this data is stored in the interview context.

### 2. Interview Start (useInterviewData hook)
**Socket Event:** `interview:start`

**Sent Data:**
```typescript
{
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  role: string;
  experienceYears: number;
  interviewerName: string; // Default: "AI Interviewer"
  interviewerEmail: string; // Default: "interviewer@company.com"
  round: string; // Default: "Technical Round 1"
}
```

**Backend Action:**
- Creates or updates candidate record
- Creates or updates interviewer record
- Creates new interview session with status "in_progress"
- Returns `interviewId`

### 3. During Interview (Real-time Capture)

#### A. Analysis Text Capture
**When:** After each Q&A analysis completes
**Socket Event:** `interview:analysis`
**Data:** Full analysis text including strengths, concerns, scores

```typescript
{
  analysisText: string; // Contains formatted analysis with scores
}
```

**Backend Action:** Stores analysis text in session for later processing

#### B. Rating Capture
**When:** User adds a rating in the RatingPanel
**Socket Event:** `interview:rating`
**Data:**
```typescript
{
  score: number; // 1-5
  competency: string; // e.g., "Technical", "Communication"
  notes?: string;
}
```

**Backend Action:** Stores rating in session array for score calculation

### 4. Interview Completion

**Socket Event:** `interview:complete`
**Trigger:** When user clicks "End Interview" and confirms

**Backend Processing:**
1. **Calculate Duration:** `(endTime - startTime) / 60000` minutes

2. **Calculate Average Scores:**
   - Groups ratings by competency (technical, communication, problem_solving, cultural_fit)
   - Calculates average for each category
   - Calculates overall score (average of all categories)

3. **Extract Insights:**
   - Parses all analysis texts
   - Extracts strengths (from "**Strengths:**" sections)
   - Extracts weaknesses (from "**Concerns:**" sections)
   - Combines top 5 strengths and top 3 weaknesses

4. **Generate Recommendation:**
   - Overall score >= 8: "Strong Hire"
   - Overall score >= 7: "Hire"
   - Overall score >= 5: "Maybe"
   - Overall score < 5: "No Hire"

5. **Save to Database:**
   - Updates interview status to "completed"
   - Saves duration
   - Inserts/updates interview_scores record with all calculated data

**Response:**
```typescript
{
  interviewId: number;
  scores: {
    technical_competency: number;
    communication_skills: number;
    problem_solving: number;
    cultural_fit: number;
    overall_score: number;
  };
  recommendation: string;
}
```

## Database Schema

### candidates
- id, name, email, phone, role, experience_years, status, timestamps

### interviewers
- id, name, email, department, timestamps

### interviews
- id, candidate_id, interviewer_id, round, interview_date, duration_minutes, status, notes, timestamps

### interview_scores
- id, interview_id, technical_competency, communication_skills, problem_solving, cultural_fit, overall_score, strengths, weaknesses, recommendation, timestamps

## API Integration

Once data is saved, the comparison dashboard automatically has access through existing APIs:

- `GET /api/candidates` - Lists all candidates with scores
- `GET /api/candidates/:id` - Detailed candidate view
- `POST /api/candidates/compare` - Compare multiple candidates
- `GET /api/candidates/export/csv` - Export data

## Configuration Options

You can customize these in the code:

### Interviewer Info (useInterviewData.ts)
```typescript
interviewerName: 'AI Interviewer', // Change to actual interviewer name
interviewerEmail: 'interviewer@company.com', // Change to actual email
```

### Interview Round (useInterviewData.ts)
```typescript
round: 'Technical Round 1', // Change to actual round name
```

### Competency Mapping (interviewDataService.ts)
The system automatically maps ratings to competencies based on keywords:
- "technical", "coding" → technical_competency
- "communication" → communication_skills
- "problem" → problem_solving
- "cultural", "culture" → cultural_fit
- Default → technical_competency

## Testing the Integration

### 1. Start an Interview
```bash
# Make sure servers are running
npm run dev
```

### 2. Fill Setup Form
- Enter candidate name and email (required)
- Fill other fields
- Click "Start Interview"

### 3. Conduct Interview
- Record questions and answers
- Click "Analyze" after each Q&A
- Add ratings as needed

### 4. End Interview
- Click "End" button
- Confirm end
- Check console for "Interview completed" message

### 5. View in Dashboard
- Navigate to http://localhost:3000/comparison
- Your candidate should appear with calculated scores

## Troubleshooting

### Interview not saving
- Check browser console for socket connection errors
- Verify backend is running on port 3001
- Check database connection

### Scores not calculating correctly
- Ensure ratings are being sent (check socket events in browser devtools)
- Verify analysis texts contain proper formatting with "**Strengths:**" and "**Concerns:**"

### Candidate not appearing in dashboard
- Check if interview was completed (status = 'completed')
- Query database: `SELECT * FROM interviews ORDER BY id DESC LIMIT 1;`
- Check for errors in backend logs

## Future Enhancements

Potential improvements:
- Allow custom interviewer selection
- Support multiple interview rounds per candidate
- Real-time dashboard updates (WebSocket)
- Interview recording/playback
- Automated email notifications
- Integration with ATS systems
- Custom scoring rubrics
- Interview templates
