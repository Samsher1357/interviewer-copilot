-- CreateTable
CREATE TABLE "InterviewSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidateName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "experienceLevel" TEXT NOT NULL,
    "interviewerName" TEXT,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "duration" INTEGER,
    "interviewerOverallScore" REAL NOT NULL DEFAULT 0,
    "interviewerRecommendation" TEXT NOT NULL DEFAULT 'maybe',
    "interviewerStrengths" TEXT NOT NULL DEFAULT '[]',
    "interviewerConcerns" TEXT NOT NULL DEFAULT '[]',
    "aiOverallScore" REAL NOT NULL DEFAULT 0,
    "aiRecommendation" TEXT NOT NULL DEFAULT 'maybe',
    "aiStrengths" TEXT NOT NULL DEFAULT '[]',
    "aiConcerns" TEXT NOT NULL DEFAULT '[]',
    "aiAnalysisText" TEXT,
    "overallScore" REAL NOT NULL DEFAULT 0,
    "recommendation" TEXT NOT NULL DEFAULT 'maybe',
    "strengths" TEXT NOT NULL DEFAULT '[]',
    "concerns" TEXT NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Turn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "speaker" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "sessionId" TEXT NOT NULL,
    CONSTRAINT "Turn_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CompetencyRating" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "competency" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "evidence" TEXT NOT NULL,
    "concerns" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'interviewer',
    "sessionId" TEXT NOT NULL,
    CONSTRAINT "CompetencyRating_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EvaluationMatrix" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "experienceLevel" TEXT NOT NULL,
    "competencies" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "InterviewTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "company" TEXT,
    "experienceLevel" TEXT NOT NULL,
    "requiredSkills" TEXT NOT NULL,
    "jobDescription" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SessionNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SessionNote_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SessionFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT,
    "feedbackType" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SessionFeedback_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "InterviewSession_role_idx" ON "InterviewSession"("role");

-- CreateIndex
CREATE INDEX "InterviewSession_interviewerName_idx" ON "InterviewSession"("interviewerName");

-- CreateIndex
CREATE INDEX "InterviewSession_startTime_idx" ON "InterviewSession"("startTime");

-- CreateIndex
CREATE INDEX "InterviewSession_interviewerRecommendation_idx" ON "InterviewSession"("interviewerRecommendation");

-- CreateIndex
CREATE INDEX "InterviewSession_aiRecommendation_idx" ON "InterviewSession"("aiRecommendation");

-- CreateIndex
CREATE INDEX "Turn_sessionId_idx" ON "Turn"("sessionId");

-- CreateIndex
CREATE INDEX "CompetencyRating_sessionId_idx" ON "CompetencyRating"("sessionId");

-- CreateIndex
CREATE INDEX "CompetencyRating_competency_idx" ON "CompetencyRating"("competency");

-- CreateIndex
CREATE INDEX "CompetencyRating_source_idx" ON "CompetencyRating"("source");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationMatrix_role_experienceLevel_key" ON "EvaluationMatrix"("role", "experienceLevel");

-- CreateIndex
CREATE INDEX "InterviewTemplate_role_idx" ON "InterviewTemplate"("role");

-- CreateIndex
CREATE INDEX "InterviewTemplate_isDefault_idx" ON "InterviewTemplate"("isDefault");

-- CreateIndex
CREATE INDEX "SessionNote_sessionId_idx" ON "SessionNote"("sessionId");

-- CreateIndex
CREATE INDEX "SessionNote_timestamp_idx" ON "SessionNote"("timestamp");

-- CreateIndex
CREATE INDEX "SessionFeedback_sessionId_idx" ON "SessionFeedback"("sessionId");

-- CreateIndex
CREATE INDEX "SessionFeedback_feedbackType_idx" ON "SessionFeedback"("feedbackType");
