# Cross-Candidate Comparison Dashboard

## Overview
A comprehensive dashboard for comparing multiple candidates side-by-side to make informed hiring decisions.

## Features

### ✅ Implemented
- **Side-by-side candidate comparison** with unlimited selection
- **Comprehensive scoring system**:
  - Technical Competency
  - Communication Skills
  - Problem Solving
  - Cultural Fit
  - Overall Score
- **Advanced filtering**:
  - By Role
  - By Interview Round
  - By Interviewer
  - By Date Range
- **Sortable views** by:
  - Overall Score
  - Technical Score
  - Communication Score
  - Name (alphabetical)
- **CSV Export** functionality
- **Visual score indicators** with color coding
- **Strengths & Weaknesses** display
- **Interview recommendations** (Strong Hire, Hire, etc.)

## Database Schema

### Tables
1. **candidates** - Candidate profiles
2. **interviewers** - Interviewer information
3. **interviews** - Interview sessions
4. **interview_scores** - Detailed scoring per interview

## API Endpoints

### GET `/api/candidates`
Fetch all candidates with optional filters
- Query params: `role`, `round`, `interviewer`, `dateFrom`, `dateTo`, `status`

### GET `/api/candidates/:id`
Get detailed candidate information

### POST `/api/candidates/compare`
Compare multiple candidates
- Body: `{ ids: [1, 2, 3] }`

### GET `/api/candidates/filters/options`
Get available filter options (roles, rounds, interviewers)

### GET `/api/candidates/export/csv`
Export candidates as CSV with filters

## Setup Instructions

### 1. Database Setup
```bash
cd backend
npm run db:setup
```

This will:
- Create all required tables
- Seed sample data (6 candidates, 4 interviewers, sample interviews)

### 2. Start Servers
```bash
# From root directory
npm run dev
```

This starts:
- Backend: http://localhost:3001
- Frontend: http://localhost:3000

### 3. Access Dashboard
- Main app: http://localhost:3000
- Comparison Dashboard: http://localhost:3000/comparison

Or click "View Candidate Comparison Dashboard" button on the setup screen.

## Usage

### Filtering Candidates
1. Click "Filters" button
2. Select desired filters (role, round, interviewer, date range)
3. Click "Apply Filters"

### Comparing Candidates
1. Click the checkmark icon on candidate cards to select
2. Selected candidates will be highlighted
3. Click "Clear Selection" to deselect all

### Sorting
1. Use the "Sort by" dropdown to choose sorting criteria
2. Click the arrow button to toggle ascending/descending order

### Exporting Data
1. Apply desired filters
2. Click "Export CSV" button
3. CSV file will download with filtered candidates

## Sample Data

The seed script includes:
- 6 sample candidates across different roles
- 4 interviewers from different departments
- Multiple interview rounds with scores
- Realistic strengths, weaknesses, and recommendations

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL with pg driver
- TypeScript

### Frontend
- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Lucide Icons

## File Structure

```
backend/
├── src/
│   ├── db/
│   │   ├── schema.sql          # Database schema
│   │   └── seed.sql            # Sample data
│   ├── routes/
│   │   └── candidates.ts       # API routes
│   ├── services/
│   │   ├── database.ts         # Database connection
│   │   └── candidateService.ts # Business logic
│   ├── types/
│   │   └── candidate.ts        # TypeScript types
│   └── scripts/
│       └── setupDatabase.ts    # Setup script

frontend/
├── app/
│   └── comparison/
│       └── page.tsx            # Dashboard page
├── components/
│   ├── ComparisonDashboard.tsx # Main dashboard
│   └── CandidateCard.tsx       # Candidate card component
└── lib/
    └── api/
        └── candidates.ts       # API client
```

## Future Enhancements (Not Implemented)
- PDF export with custom templates
- Access control and permissions
- Advanced analytics and insights
- Interview scheduling integration
- Email notifications
- Candidate notes and comments
- Interview video playback
- AI-powered recommendations
