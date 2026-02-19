# Quick Start Guide

## Setup (One Time)

```bash
# 1. Install dependencies (if not done)
npm install

# 2. Setup database
cd backend
npm run db:setup
cd ..

# 3. Configure environment
# Edit backend/.env with your database credentials and API keys
```

## Running the Application

```bash
# Start both servers
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Dashboard: http://localhost:3000/comparison

## Conducting an Interview

1. **Setup** (http://localhost:3000)
   - Enter candidate name
   - Enter candidate email (required!)
   - Fill role, skills, etc.
   - Click "Start Interview"

2. **Interview**
   - Click "Record" to start microphone
   - Ask questions (detected automatically)
   - Candidate answers (transcribed automatically)
   - Click "Analyze" after each Q&A
   - Add ratings in the rating panel
   - Repeat for multiple questions

3. **Complete**
   - Click "End" button
   - Confirm end
   - Data is automatically saved!

4. **View Results**
   - Click "View Candidate Comparison Dashboard" link
   - Or navigate to http://localhost:3000/comparison
   - Your candidate appears with calculated scores

## Using the Dashboard

### Filtering
1. Click "Filters" button
2. Select role, round, interviewer, or date range
3. Click "Apply Filters"

### Comparing
1. Click checkmark on candidate cards to select
2. Selected candidates are highlighted
3. Click "Clear Selection" to reset

### Sorting
1. Use "Sort by" dropdown
2. Choose: Overall Score, Technical, Communication, or Name
3. Click arrow to toggle ascending/descending

### Exporting
1. Apply desired filters (optional)
2. Click "Export CSV"
3. File downloads automatically

## Key Data Points Captured

**From Setup:**
- Candidate name, email, phone
- Role and experience level
- Required skills

**During Interview:**
- Questions asked
- Candidate answers
- AI analysis (strengths, concerns)
- Ratings per question
- Competency assessments

**Calculated Automatically:**
- Technical competency score
- Communication skills score
- Problem solving score
- Cultural fit score
- Overall score (average)
- Strengths summary
- Weaknesses summary
- Recommendation (Strong Hire, Hire, Maybe, No Hire)

## Troubleshooting

**Interview not saving?**
- Make sure you filled the email field
- Check browser console for errors
- Verify backend is running

**Candidate not in dashboard?**
- Make sure you clicked "End" and confirmed
- Check interview status: `SELECT * FROM interviews ORDER BY id DESC LIMIT 1;`
- Refresh the dashboard page

**Scores look wrong?**
- Ensure you added ratings during the interview
- Check that analysis completed successfully
- Ratings should have competency keywords (technical, communication, etc.)

## Quick Database Queries

```sql
-- View all candidates
SELECT * FROM candidates;

-- View recent interviews
SELECT c.name, i.round, i.status, i.interview_date 
FROM interviews i 
JOIN candidates c ON i.candidate_id = c.id 
ORDER BY i.interview_date DESC;

-- View scores
SELECT c.name, s.overall_score, s.recommendation 
FROM interview_scores s 
JOIN interviews i ON s.interview_id = i.id 
JOIN candidates c ON i.candidate_id = c.id;
```

## API Endpoints

```bash
# List all candidates
curl http://localhost:3001/api/candidates

# Get specific candidate
curl http://localhost:3001/api/candidates/1

# Get filter options
curl http://localhost:3001/api/candidates/filters/options

# Export CSV
curl http://localhost:3001/api/candidates/export/csv > candidates.csv
```

## That's It!

You're ready to conduct interviews and compare candidates. The system handles all the data capture and scoring automatically.
