-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
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
    "nationality" TEXT,
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
    "theme" TEXT NOT NULL DEFAULT 'mixed',
    "language" TEXT NOT NULL DEFAULT 'en',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "defaultGoalCategory" TEXT NOT NULL DEFAULT 'personal',
    "privacyLevel" TEXT NOT NULL DEFAULT 'private',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("ageRange", "aiApproachStyle", "aiDetailLevel", "aiInstructions", "aiTone", "annualIncome", "availableTime", "communicationStyle", "createdAt", "currency", "currentSavings", "currentSituation", "decisionMakingStyle", "defaultGoalCategory", "email", "emailNotifications", "firstGoal", "goalReminders", "googleId", "id", "language", "learningStyle", "lifePriorities", "location", "motivationalFactors", "name", "nationality", "occupation", "onboardingCompleted", "personalityType", "preferredApproach", "previousExperiences", "privacyLevel", "profilePicture", "pushNotifications", "riskTolerance", "skillsAndStrengths", "theme", "updatedAt", "weeklyReports", "workSchedule") SELECT "ageRange", "aiApproachStyle", "aiDetailLevel", "aiInstructions", "aiTone", "annualIncome", "availableTime", "communicationStyle", "createdAt", "currency", "currentSavings", "currentSituation", "decisionMakingStyle", "defaultGoalCategory", "email", "emailNotifications", "firstGoal", "goalReminders", "googleId", "id", "language", "learningStyle", "lifePriorities", "location", "motivationalFactors", "name", "nationality", "occupation", "onboardingCompleted", "personalityType", "preferredApproach", "previousExperiences", "privacyLevel", "profilePicture", "pushNotifications", "riskTolerance", "skillsAndStrengths", "theme", "updatedAt", "weeklyReports", "workSchedule" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
