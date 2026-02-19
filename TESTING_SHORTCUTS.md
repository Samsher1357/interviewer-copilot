# Testing Shortcuts - No More Recording Headache! 🎉

## Problem
Testing interviews is tedious - you have to record both interviewer and candidate sides repeatedly.

## Solution
Automatic mock interview generation with realistic data!

## 3 Easy Ways to Test

### 1. 🖱️ UI Button (Easiest!)

**Dashboard mein button hai:**
1. Go to http://localhost:3000/comparison
2. Top-right corner mein 2 buttons dikhenge:
   - **"Quick Test (1 Interview)"** - Ek interview instantly
   - **"Bulk Test (5 Interviews)"** - 5 interviews ek saath

3. Click karo, wait karo 2 seconds, page refresh hoga
4. New candidates with scores automatically dikhengi!

### 2. ⚡ Command Line (Super Fast!)

```bash
cd backend
npm run mock
```

**Output:**
```
⚡ Quick Mock Interview Generator
✅ Mock interview created!
   ID: 12
   Name: Test Candidate 1771523734680
   Email: test1771523734680@example.com
   Overall Score: 4/10
   Recommendation: No Hire
```

Har baar run karne pe new candidate create hoga!

### 3. 🔌 API Call (For Automation)

**Single Interview:**
```bash
curl -X POST http://localhost:3001/api/mock/generate \
  -H "Content-Type: application/json" \
  -d '{
    "candidateName": "Rohit Kumar",
    "candidateEmail": "rohit@example.com",
    "role": "Senior Developer"
  }'
```

**Bulk Interviews (5 at once):**
```bash
curl -X POST http://localhost:3001/api/mock/generate-bulk \
  -H "Content-Type: application/json" \
  -d '{"count": 5}'
```

## What Gets Generated?

### Candidate Data
- Random name (or your provided name)
- Unique email
- Phone number
- Role (Software Engineer, Senior Developer, etc.)
- Experience years (1-10)

### Interview Data
- Interview round: "Technical Round 1"
- Duration: 20-50 minutes (random)
- Status: "completed"

### Realistic Scores
- Technical: 3-5 (random)
- Communication: 3-5 (random)
- Problem Solving: 3-5 (random)
- Cultural Fit: 3-5 (random)
- Overall: Average of all
- Recommendation: Based on overall score

### Analysis
- Strengths: "Strong technical fundamentals, Good problem-solving approach, Clean code practices"
- Weaknesses: "Could improve on system design, Limited experience with distributed systems"

## Testing Scenarios

### Scenario 1: Quick Dashboard Test
```bash
# Generate 5 candidates
cd backend
npm run mock
npm run mock
npm run mock
npm run mock
npm run mock

# Or use bulk
curl -X POST http://localhost:3001/api/mock/generate-bulk \
  -H "Content-Type: application/json" \
  -d '{"count": 5}'
```

### Scenario 2: Test Filtering
```bash
# Generate candidates with different roles
curl -X POST http://localhost:3001/api/mock/generate \
  -d '{"role": "Frontend Developer"}'

curl -X POST http://localhost:3001/api/mock/generate \
  -d '{"role": "Backend Developer"}'

curl -X POST http://localhost:3001/api/mock/generate \
  -d '{"role": "Full Stack Developer"}'
```

### Scenario 3: Test Sorting
```bash
# Generate 10 candidates with varying scores
for i in {1..10}; do
  npm run mock
done
```

### Scenario 4: Clean Slate Testing
```bash
# Drop all data
npm run db:drop

# Setup fresh database with sample data
npm run db:setup

# Add your test data
npm run mock
npm run mock
```

## Pro Tips

### 1. Bulk Generation for Load Testing
```javascript
// In browser console on dashboard page
for (let i = 0; i < 10; i++) {
  fetch('http://localhost:3001/api/mock/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
}
```

### 2. Custom Test Data
```bash
curl -X POST http://localhost:3001/api/mock/generate \
  -H "Content-Type: application/json" \
  -d '{
    "candidateName": "Rohit Bagade",
    "candidateEmail": "rohitbagde535@gmail.com",
    "role": "SDE"
  }'
```

### 3. Reset and Test
```bash
# Complete reset
cd backend
npm run db:drop
npm run db:setup

# Add 5 test interviews
npm run mock
npm run mock
npm run mock
npm run mock
npm run mock

# Check dashboard
# http://localhost:3000/comparison
```

## Comparison: Old vs New

### ❌ Old Way (Tedious)
1. Fill setup form
2. Start interview
3. Click record
4. Speak question (as interviewer)
5. Stop recording
6. Click record again
7. Speak answer (as candidate)
8. Stop recording
9. Click analyze
10. Wait for AI
11. Add rating
12. Repeat 5-10 times
13. End interview
14. Check dashboard

**Time: 10-15 minutes per interview**

### ✅ New Way (Easy!)
1. Click "Quick Test" button
2. Done!

**Time: 2 seconds per interview**

Or:
```bash
npm run mock
```
**Time: 1 second per interview**

## API Endpoints

### POST /api/mock/generate
Generate single mock interview

**Request:**
```json
{
  "candidateName": "Optional Name",
  "candidateEmail": "optional@email.com",
  "role": "Optional Role"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mock interview generated successfully",
  "data": {
    "interviewId": 12,
    "candidateName": "Test Candidate 123",
    "candidateEmail": "test123@example.com",
    "role": "Software Engineer",
    "scores": {
      "technical_competency": 4,
      "communication_skills": 5,
      "problem_solving": 4,
      "cultural_fit": 4,
      "overall_score": 4.25
    },
    "recommendation": "No Hire"
  }
}
```

### POST /api/mock/generate-bulk
Generate multiple mock interviews

**Request:**
```json
{
  "count": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Generated 5 mock interviews",
  "data": [
    { "name": "Rahul 123", "email": "test123@example.com", "role": "Software Engineer", "scores": 4.5 },
    { "name": "Priya 124", "email": "test124@example.com", "role": "Senior Developer", "scores": 3.75 },
    ...
  ]
}
```

## Troubleshooting

### Button not working?
- Check browser console for errors
- Make sure backend is running on port 3001
- Check CORS settings

### Command not working?
```bash
# Make sure you're in backend directory
cd backend

# Check if database is connected
npm run test:db

# Try again
npm run mock
```

### No data showing in dashboard?
- Refresh the page
- Check if interviews are completed: `SELECT * FROM interviews WHERE status = 'completed';`
- Check backend logs

## Summary

Ab testing bahut easy hai! No more recording headache. Just click button or run command, and you're done! 🎉

**Recommended for testing:**
1. Use UI buttons for quick visual testing
2. Use `npm run mock` for repeated testing
3. Use API for automation/scripts
