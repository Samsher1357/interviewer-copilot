# Delete Candidate Feature

## Overview
Added delete functionality to remove candidates and all their related data from the dashboard.

## What Gets Deleted?

When you delete a candidate, the following data is automatically removed (CASCADE):

1. **Candidate record** - Name, email, phone, role, etc.
2. **All interviews** - All interview sessions for that candidate
3. **All interview scores** - Technical, communication, problem-solving, cultural fit scores
4. **All analysis data** - Strengths, weaknesses, recommendations

## How to Use

### 1. From Dashboard UI

1. Go to http://localhost:3000/comparison
2. Find the candidate card you want to delete
3. Click the **red trash icon** (🗑️) in the top-right corner of the card
4. Confirm the deletion in the popup dialog
5. Candidate is removed immediately

### 2. From API

```bash
# Delete candidate by ID
curl -X DELETE http://localhost:3001/api/candidates/1
```

**Response:**
```json
{
  "success": true,
  "message": "Candidate deleted successfully"
}
```

### 3. From Database (Direct)

```sql
-- Delete specific candidate
DELETE FROM candidates WHERE id = 1;

-- Delete by email
DELETE FROM candidates WHERE email = 'test@example.com';

-- Delete all test candidates
DELETE FROM candidates WHERE email LIKE 'test%@example.com';
```

## Safety Features

### Confirmation Dialog
- Before deleting, a confirmation popup appears
- Message: "Are you sure you want to delete this candidate? This will also delete all their interviews and scores."
- Must click "OK" to proceed

### CASCADE Delete
- Database schema uses `ON DELETE CASCADE`
- Automatically removes all related data
- No orphaned records left behind

### Error Handling
- If delete fails, shows error message
- Candidate list refreshes automatically after successful delete
- Selected candidates list is updated if deleted candidate was selected

## Use Cases

### 1. Remove Test Data
```bash
# After testing, delete all test candidates
cd backend
npm run mock  # Creates test candidate
# Then delete from UI
```

### 2. Clean Up Duplicates
If you accidentally created duplicate candidates, easily remove them from the dashboard.

### 3. Remove Outdated Data
Delete candidates who are no longer in the hiring pipeline.

### 4. Bulk Cleanup
```sql
-- Delete all candidates with no interviews
DELETE FROM candidates 
WHERE id NOT IN (SELECT DISTINCT candidate_id FROM interviews);

-- Delete all test candidates
DELETE FROM candidates WHERE email LIKE 'test%';
```

## API Endpoint

### DELETE /api/candidates/:id

**Parameters:**
- `id` (path parameter) - Candidate ID to delete

**Success Response:**
```json
{
  "success": true,
  "message": "Candidate deleted successfully"
}
```

**Error Responses:**

Invalid ID:
```json
{
  "error": "Invalid candidate ID"
}
```

Delete failed:
```json
{
  "error": "Failed to delete candidate"
}
```

## Database Schema

The CASCADE delete is configured in the schema:

```sql
CREATE TABLE interviews (
  id SERIAL PRIMARY KEY,
  candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  ...
);

CREATE TABLE interview_scores (
  id SERIAL PRIMARY KEY,
  interview_id INTEGER NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  ...
);
```

This means:
- Delete candidate → Automatically deletes all interviews
- Delete interview → Automatically deletes all scores

## Testing

### Test Delete Functionality

1. **Create test candidate:**
```bash
cd backend
npm run mock
```

2. **View in dashboard:**
- Go to http://localhost:3000/comparison
- Find the new test candidate

3. **Delete:**
- Click trash icon
- Confirm deletion
- Verify candidate is removed

4. **Verify in database:**
```sql
-- Check if candidate is gone
SELECT * FROM candidates WHERE email LIKE 'test%';

-- Should return 0 rows
```

### Bulk Delete Test

```bash
# Create 5 test candidates
cd backend
npm run mock
npm run mock
npm run mock
npm run mock
npm run mock

# Delete all from UI or database
DELETE FROM candidates WHERE email LIKE 'test%@example.com';
```

## UI Features

### Delete Button
- **Location:** Top-right corner of candidate card
- **Icon:** Red trash icon (🗑️)
- **Color:** Red background on hover
- **Tooltip:** "Delete candidate"

### Visual Feedback
- Confirmation dialog before delete
- Immediate removal from list after delete
- Error alert if delete fails
- Smooth animation when card is removed

## Permissions

Currently, there are no permission checks. Anyone can delete any candidate.

**Future Enhancement:** Add role-based access control:
- Only admins can delete
- Only hiring managers can delete
- Soft delete (mark as deleted instead of removing)

## Troubleshooting

### Delete button not showing?
- Refresh the page (Ctrl + Shift + R)
- Check browser console for errors
- Verify backend is running

### Delete not working?
- Check backend logs for errors
- Verify database connection
- Check candidate ID is valid

### Accidentally deleted?
- No undo feature currently
- Restore from database backup if available
- Or recreate the candidate manually

## Summary

Delete feature is now fully functional:
- ✅ UI delete button on each candidate card
- ✅ Confirmation dialog for safety
- ✅ CASCADE delete removes all related data
- ✅ API endpoint for programmatic deletion
- ✅ Error handling and user feedback
- ✅ Automatic list refresh after delete

Easy to use and safe with confirmation!
