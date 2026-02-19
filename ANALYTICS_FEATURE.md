# Session History & Interviewer Analytics

## Overview
Complete analytics dashboard with session history tracking and interviewer performance metrics.

## Features Implemented

### 1. Session History ✅
- **Timeline view** of all interview sessions
- **Detailed information** for each session:
  - Candidate name, email, role
  - Interviewer name
  - Interview round
  - Date and duration
  - Overall score
  - Recommendation (Strong Hire, Hire, Maybe, No Hire)

### 2. Interviewer Analytics ✅
- **Performance metrics** for each interviewer:
  - Total interviews conducted
  - Average score given
  - Average interview duration
  - Interviews this week/month
  - Breakdown by recommendation type

### 3. System Statistics ✅
- **Overview cards** showing:
  - Total interviews
  - Total candidates
  - Average overall score
  - Total strong hires

### 4. Filtering & Search ✅
- Filter sessions by:
  - Candidate name
  - Interviewer name
  - Date range (from/to)
  - Status (completed, in progress)
  - Interview round

## Access Points

### 1. From Setup Screen
- Go to http://localhost:3000
- Click "Analytics Dashboard" button

### 2. Direct URL
- http://localhost:3000/analytics

### 3. Navigation
- Two tabs:
  - **Session History** - All interview sessions
  - **Interviewer Analytics** - Performance metrics

## API Endpoints

### GET /api/analytics/sessions
Get session history with optional filters

**Query Parameters:**
- `candidateName` - Filter by candidate name
- `interviewerName` - Filter by interviewer name
- `dateFrom` - Start date (YYYY-MM-DD)
- `dateTo` - End date (YYYY-MM-DD)
- `status` - Filter by status (completed, in_progress)
- `round` - Filter by interview round

**Response:**
```json
[
  {
    "interview_id": 1,
    "candidate_name": "Rohit",
    "candidate_email": "rohit@example.com",
    "candidate_role": "SDE",
    "interviewer_name": "AI Interviewer",
    "round": "Technical Round 1",
    "interview_date": "2026-02-18T12:30:00Z",
    "duration_minutes": 30,
    "status": "completed",
    "overall_score": 4.5,
    "recommendation": "No Hire"
  }
]
```

### GET /api/analytics/interviewers
Get interviewer analytics

**Query Parameters:**
- `interviewerId` (optional) - Get stats for specific interviewer

**Response:**
```json
[
  {
    "interviewer_id": 1,
    "interviewer_name": "AI Interviewer",
    "interviewer_email": "interviewer@company.com",
    "total_interviews": 15,
    "avg_duration_minutes": 32.5,
    "avg_score_given": 4.2,
    "total_strong_hire": 2,
    "total_hire": 5,
    "total_maybe": 4,
    "total_no_hire": 4,
    "interviews_this_month": 10,
    "interviews_this_week": 3
  }
]
```

### GET /api/analytics/stats
Get overall system statistics

**Response:**
```json
{
  "total_candidates": 25,
  "total_interviews": 30,
  "total_interviewers": 4,
  "avg_overall_score": 4.3,
  "completed_interviews": 28,
  "in_progress_interviews": 2,
  "total_strong_hires": 5,
  "total_hires": 12
}
```

### GET /api/analytics/trends
Get interview trends (last 30 days)

**Response:**
```json
[
  {
    "date": "2026-02-18",
    "interview_count": 5,
    "avg_score": 4.2
  }
]
```

## UI Components

### Session History Table
- **Columns:**
  - Candidate (name + email)
  - Role
  - Interviewer
  - Round
  - Date
  - Duration (with clock icon)
  - Score (color-coded badge)
  - Recommendation (color-coded badge)

- **Features:**
  - Sortable columns
  - Hover effects
  - Responsive design
  - Empty state message

### Interviewer Cards
- **Information displayed:**
  - Name and email
  - Total interviews
  - Average score given
  - Average duration
  - Interviews this week
  - Recommendation breakdown (badges)

- **Layout:**
  - Grid layout (2 columns on desktop)
  - Card-based design
  - Color-coded metrics

### System Stats Cards
- **4 Cards showing:**
  1. Total Interviews (blue icon)
  2. Total Candidates (purple icon)
  3. Average Score (green icon)
  4. Strong Hires (yellow icon)

## Color Coding

### Scores
- **Green** (8-10): Excellent
- **Yellow** (6-7.9): Good
- **Red** (<6): Needs Improvement

### Recommendations
- **Strong Hire**: Green badge
- **Hire**: Blue badge
- **Maybe**: Yellow badge
- **No Hire**: Red badge
- **Pending**: Gray badge

## Use Cases

### 1. Review Interview History
```
1. Go to Analytics Dashboard
2. Click "Session History" tab
3. View all past interviews
4. Use filters to narrow down
```

### 2. Check Interviewer Performance
```
1. Go to Analytics Dashboard
2. Click "Interviewer Analytics" tab
3. View metrics for each interviewer
4. Compare performance across team
```

### 3. Filter by Date Range
```
1. Click "Filters" button
2. Select "From" and "To" dates
3. Click "Apply"
4. View sessions in that range
```

### 4. Search by Candidate
```
1. Click "Filters" button
2. Enter candidate name
3. Click "Apply"
4. View all sessions for that candidate
```

### 5. Track Weekly Activity
```
1. Go to Interviewer Analytics tab
2. Check "This Week" metric
3. See who's most active
```

## Testing

### Test with Mock Data
```bash
# Generate 5 mock interviews
cd backend
npm run mock
npm run mock
npm run mock
npm run mock
npm run mock

# View in analytics
# http://localhost:3000/analytics
```

### Test Filters
```bash
# Create interviews with different dates
npm run mock  # Creates interview with current date

# Then filter by date range in UI
```

### Test API Directly
```bash
# Get all sessions
curl http://localhost:3001/api/analytics/sessions

# Get sessions for specific candidate
curl "http://localhost:3001/api/analytics/sessions?candidateName=Rohit"

# Get interviewer stats
curl http://localhost:3001/api/analytics/interviewers

# Get system stats
curl http://localhost:3001/api/analytics/stats
```

## Database Queries

The analytics service uses optimized SQL queries with:
- **JOINs** for related data
- **Aggregations** (COUNT, AVG, ROUND)
- **CASE statements** for conditional counting
- **Date filtering** with INTERVAL
- **Grouping** for statistics

Example query for interviewer stats:
```sql
SELECT 
  iv.name,
  COUNT(i.id) as total_interviews,
  AVG(s.overall_score) as avg_score_given,
  COUNT(CASE WHEN s.recommendation = 'Strong Hire' THEN 1 END) as total_strong_hire
FROM interviewers iv
LEFT JOIN interviews i ON iv.id = i.interviewer_id
LEFT JOIN interview_scores s ON i.id = s.interview_id
GROUP BY iv.id
```

## Performance

- **Efficient queries** with proper indexing
- **Caching** at database level
- **Pagination** ready (can be added)
- **Lazy loading** for large datasets

## Future Enhancements

Potential additions:
- **Charts & Graphs** (trend lines, bar charts)
- **Export to PDF** (analytics reports)
- **Email reports** (weekly/monthly summaries)
- **Real-time updates** (WebSocket)
- **Advanced filters** (score range, multiple interviewers)
- **Comparison view** (compare interviewers)
- **Time-based analytics** (hourly, daily, weekly trends)
- **Candidate journey** (track through multiple rounds)

## Summary

✅ **Session History** - Complete timeline of all interviews
✅ **Interviewer Analytics** - Performance metrics and statistics
✅ **System Stats** - Overview of entire system
✅ **Filtering** - Search and filter by multiple criteria
✅ **API Endpoints** - RESTful API for all analytics data
✅ **Responsive UI** - Works on all screen sizes
✅ **Color Coding** - Visual indicators for quick insights

Access at: http://localhost:3000/analytics
