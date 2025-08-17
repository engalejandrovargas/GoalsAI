-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "googleId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profilePicture" TEXT,
    "location" TEXT,
    "ageRange" TEXT,
    "currentSituation" TEXT,
    "availableTime" TEXT,
    "riskTolerance" TEXT,
    "preferredApproach" TEXT,
    "firstGoal" TEXT,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "occupation" TEXT,
    "annualIncome" INTEGER,
    "currentSavings" INTEGER,
    "workSchedule" TEXT,
    "personalityType" TEXT,
    "learningStyle" TEXT,
    "decisionMakingStyle" TEXT,
    "communicationStyle" TEXT,
    "motivationalFactors" TEXT,
    "lifePriorities" TEXT,
    "previousExperiences" TEXT,
    "skillsAndStrengths" TEXT,
    "aiInstructions" TEXT,
    "aiTone" TEXT NOT NULL DEFAULT 'helpful',
    "aiDetailLevel" TEXT NOT NULL DEFAULT 'balanced',
    "aiApproachStyle" TEXT NOT NULL DEFAULT 'adaptive',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT false,
    "weeklyReports" BOOLEAN NOT NULL DEFAULT true,
    "goalReminders" BOOLEAN NOT NULL DEFAULT true,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "language" TEXT NOT NULL DEFAULT 'en',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "defaultGoalCategory" TEXT NOT NULL DEFAULT 'personal',
    "privacyLevel" TEXT NOT NULL DEFAULT 'private',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'planning',
    "estimatedCost" INTEGER,
    "currentSaved" INTEGER NOT NULL DEFAULT 0,
    "targetDate" DATETIME,
    "feasibilityScore" INTEGER,
    "feasibilityAnalysis" TEXT,
    "redFlags" TEXT,
    "suggestedAlternatives" TEXT,
    "aiPlan" TEXT,
    "researchData" TEXT,
    "chatHistory" TEXT,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "goal_steps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "goalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "stepOrder" INTEGER NOT NULL,
    "estimatedCost" INTEGER,
    "estimatedDuration" TEXT,
    "deadline" DATETIME,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL DEFAULT 'ai',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "goal_steps_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goals" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "goal_pivots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "originalGoalId" TEXT NOT NULL,
    "newGoalId" TEXT,
    "pivotReason" TEXT NOT NULL,
    "aiRecommendation" BOOLEAN NOT NULL DEFAULT true,
    "originalFeasibility" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "goal_pivots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "goal_pivots_originalGoalId_fkey" FOREIGN KEY ("originalGoalId") REFERENCES "goals" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "chat_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "goalId" TEXT,
    "messages" TEXT NOT NULL,
    "sessionType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "chat_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "chat_sessions_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goals" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
