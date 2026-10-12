-- CreateTable
CREATE TABLE "GranolaTranscript" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "granolaId" TEXT NOT NULL,
    "clientProfileId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "transcript" TEXT NOT NULL,
    "summary" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GranolaTranscript_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UnmatchedTranscript" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "granolaId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "transcript" TEXT NOT NULL,
    "assignedClientId" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "GranolaSyncLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "runAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meetingsFound" INTEGER NOT NULL,
    "transcriptsSaved" INTEGER NOT NULL,
    "unmatched" INTEGER NOT NULL,
    "errors" TEXT
);

-- CreateTable
CREATE TABLE "BusinessContextIntake" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientProfileId" TEXT NOT NULL,
    "businessDescription" TEXT,
    "productsServices" TEXT,
    "targetAudience" TEXT,
    "pricePoints" TEXT,
    "revenueModel" TEXT,
    "currentRevenue" TEXT,
    "revenueGoal" TEXT,
    "biggestRevenueChallenge" TEXT,
    "currentMarketingChannels" TEXT,
    "contentFrequency" TEXT,
    "bestPerformingContent" TEXT,
    "contentChallenges" TEXT,
    "brandVoice" TEXT,
    "uniqueValueProp" TEXT,
    "competitors" TEXT,
    "founderStrengths" TEXT,
    "founderWeaknesses" TEXT,
    "workStyle" TEXT,
    "biggestFear" TEXT,
    "biggestMotivation" TEXT,
    "supportNeeded" TEXT,
    "programmeGoal1" TEXT,
    "programmeGoal2" TEXT,
    "programmeGoal3" TEXT,
    "successLooksLike" TEXT,
    "submittedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BusinessContextIntake_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OnboardingStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientProfileId" TEXT NOT NULL,
    "step" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "agentDraftId" TEXT,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OnboardingStep_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChurnRisk" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientProfileId" TEXT NOT NULL,
    "signal" TEXT NOT NULL,
    "detectedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" DATETIME,
    CONSTRAINT "ChurnRisk_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GoalSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "goalId" TEXT NOT NULL,
    "clientProfileId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "progressAtSnapshot" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GoalSnapshot_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClientProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "founderName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "tier" TEXT NOT NULL DEFAULT 'CORE',
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentMonth" INTEGER NOT NULL DEFAULT 1,
    "currentWeek" INTEGER NOT NULL DEFAULT 1,
    "currentPhase" TEXT NOT NULL DEFAULT 'DIAGNOSE',
    "businessContext" TEXT,
    "personalityNotes" TEXT,
    "communicationStyle" TEXT,
    "monthlyInvestment" REAL,
    "billingNotes" TEXT,
    "nextBillingDate" DATETIME,
    "weeklyFocus" TEXT,
    "nextSessionFocus" TEXT,
    "primaryPlatform" TEXT NOT NULL DEFAULT 'Instagram',
    "platforms" TEXT NOT NULL DEFAULT 'Instagram',
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ClientProfile" ("billingNotes", "businessContext", "businessName", "communicationStyle", "createdAt", "currentMonth", "currentPhase", "currentWeek", "email", "founderName", "id", "monthlyInvestment", "nextBillingDate", "personalityNotes", "phone", "startDate", "tier", "updatedAt", "userId", "website", "weeklyFocus") SELECT "billingNotes", "businessContext", "businessName", "communicationStyle", "createdAt", "currentMonth", "currentPhase", "currentWeek", "email", "founderName", "id", "monthlyInvestment", "nextBillingDate", "personalityNotes", "phone", "startDate", "tier", "updatedAt", "userId", "website", "weeklyFocus" FROM "ClientProfile";
DROP TABLE "ClientProfile";
ALTER TABLE "new_ClientProfile" RENAME TO "ClientProfile";
CREATE UNIQUE INDEX "ClientProfile_userId_key" ON "ClientProfile"("userId");
CREATE TABLE "new_Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'Operations',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "assignedTo" TEXT NOT NULL DEFAULT 'client',
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME,
    "notes" TEXT,
    "dueDate" DATETIME,
    "weekNumber" INTEGER,
    "monthNumber" INTEGER,
    "goalId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "owner" TEXT NOT NULL DEFAULT 'Client',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("assignedTo", "category", "clientProfileId", "completed", "completedAt", "createdAt", "description", "dueDate", "id", "monthNumber", "notes", "priority", "title", "updatedAt", "weekNumber") SELECT "assignedTo", "category", "clientProfileId", "completed", "completedAt", "createdAt", "description", "dueDate", "id", "monthNumber", "notes", "priority", "title", "updatedAt", "weekNumber" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "GranolaTranscript_granolaId_key" ON "GranolaTranscript"("granolaId");

-- CreateIndex
CREATE UNIQUE INDEX "UnmatchedTranscript_granolaId_key" ON "UnmatchedTranscript"("granolaId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessContextIntake_clientProfileId_key" ON "BusinessContextIntake"("clientProfileId");
