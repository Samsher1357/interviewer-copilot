# Interviewer Copilot - Development Context

## Project Overview
AI-powered interview copilot that assists interviewers with real-time transcription, AI analysis, follow-up questions, and candidate evaluation.

## Tech Stack
- **Backend:** Node.js, Express, TypeScript, Prisma (SQLite), Socket.IO
- **Frontend:** Next.js 14, React, TypeScript, TailwindCSS, Zustand
- **AI:** LangChain with OpenAI (gpt-4o-mini) / Google Gemini support
- **Transcription:** Deepgram API

## Features Implemented

### 1. Email Feedback (Completed)
- **`backend/src/services/emailService.ts`** — SendGrid-based email service
- **`backend/src/config/index.ts`** — Added `sendgridApiKey` and `senderEmail` env vars
- **`backend/src/routes/sessions.ts`** — Added `POST /sessions/:id/send-email` endpoint
- **`frontend/components/SendEmailButton.tsx`** — Reusable send email button with modal
- **`frontend/components/SetupScreen.tsx`** — Added candidate email input field
- **`frontend/lib/types.ts`** — Added `candidateEmail?` to InterviewContext and InterviewSession
- **`frontend/app/evaluate/page.tsx`** — Integrated SendEmailButton on evaluation page
- **Env vars needed:** `SENDGRID_API_KEY`, `SENDER_EMAIL` in `backend/.env`

### 2. Preset Questions in Templates (Completed)
- **`backend/prisma/schema.prisma`** — Added `presetQuestions String @default("[]")` field to InterviewTemplate model
- **`backend/src/services/prismaStorageService.ts`** — JSON serialize/deserialize for presetQuestions in all CRUD methods (getTemplates, getTemplate, createTemplate, updateTemplate)
- **`frontend/components/TemplateManager.tsx`** — Added:
  - `presetQuestions?: string[]` to Template interface
  - Textarea input (6 rows) for adding questions one per line in create/edit form
  - Question preview in template list (shows first 3 questions + count)
  - Fixed textarea to allow natural typing with spaces and newlines
  - Parse questions text into array only on save
- **`frontend/components/SetupScreen.tsx`** — Added:
  - `presetQuestions` state to store questions from selected template
  - Updated `handleSelectTemplate` to load questions from template
  - Blue-highlighted section showing all preset questions when template is selected
- **DB migration applied** via `npx prisma db push` ✅

## Known Issues
- OpenAI API key may timeout — app supports Google Gemini as fallback (change model in `interviewerSocketHandler.ts`)
- PDF service is untouched — original generation logic preserved

## Environment Variables (backend/.env)
```
DEEPGRAM_API_KEY=<required>
OPENAI_API_KEY=<required, or use GOOGLE_API_KEY>
GOOGLE_API_KEY=<optional fallback>
SENDGRID_API_KEY=<optional, for email feature>
SENDER_EMAIL=<optional, defaults to noreply@interviewcopilot.com>
DATABASE_URL=file:./prisma/dev.db
FRONTEND_URL=http://localhost:3000
```
