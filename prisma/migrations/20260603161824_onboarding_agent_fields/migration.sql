/*
  Warnings:

  - You are about to drop the column `bestPerformingContent` on the `BusinessContextIntake` table. All the data in the column will be lost.
  - You are about to drop the column `biggestFear` on the `BusinessContextIntake` table. All the data in the column will be lost.
  - You are about to drop the column `biggestMotivation` on the `BusinessContextIntake` table. All the data in the column will be lost.
  - You are about to drop the column `biggestRevenueChallenge` on the `BusinessContextIntake` table. All the data in the column will be lost.
  - You are about to drop the column `brandVoice` on the `BusinessContextIntake` table. All the data in the column will be lost.
  - You are about to drop the column `businessDescription` on the `BusinessContextIntake` table. All the data in the column will be lost.
  - You are about to drop the column `competitors` on the `BusinessContextIntake` table. All the data in the column will be lost.
  - You are about to drop the column `contentChallenges` on the `BusinessContextIntake` table. All the data in the column will be lost.
  - You are about to drop the column `contentFrequency` on the `BusinessContextIntake` table. All the data in the column will be lost.
  - You are about to drop the column `currentMarketingChannels` on the `BusinessContextIntake` table. All the data in the column will be lost.
  - You are about to drop the column `founderStrengths` on the `BusinessContextIntake` table. All the data in the column will be lost.
  - You are about to drop the column `founderWeaknesses` on the `BusinessContextIntake` table. All the data in the column will be lost.
  - You are about to drop the column `pricePoints` on the `BusinessContextIntake` table. All the data in the column will be lost.
  - You are about to drop the column `productsServices` on the `BusinessContextIntake` table. All the data in the column will be lost.
  - You are about to drop the column `programmeGoal1` on the `BusinessContextIntake` table. All the data in the column will be lost.
  - You are about to drop the column `programmeGoal2` on the `BusinessContextIntake` table. All the data in the column will be lost.
  - You are about to drop the column `programmeGoal3` on the `BusinessContextIntake` table. All the data in the column will be lost.
  - You are about to drop the column `revenueModel` on the `BusinessContextIntake` table. All the data in the column will be lost.
  - You are about to drop the column `successLooksLike` on the `BusinessContextIntake` table. All the data in the column will be lost.
  - You are about to drop the column `supportNeeded` on the `BusinessContextIntake` table. All the data in the column will be lost.
  - You are about to drop the column `targetAudience` on the `BusinessContextIntake` table. All the data in the column will be lost.
  - You are about to drop the column `uniqueValueProp` on the `BusinessContextIntake` table. All the data in the column will be lost.
  - You are about to drop the column `workStyle` on the `BusinessContextIntake` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BusinessContextIntake" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientProfileId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL DEFAULT '',
    "whatTheyDo" TEXT NOT NULL DEFAULT '',
    "whoTheyServe" TEXT NOT NULL DEFAULT '',
    "howLongTrading" TEXT NOT NULL DEFAULT '',
    "currentRevenue" TEXT NOT NULL DEFAULT '',
    "revenueGoal" TEXT NOT NULL DEFAULT '',
    "biggestChallenge" TEXT NOT NULL DEFAULT '',
    "whatTheyTried" TEXT NOT NULL DEFAULT '',
    "whatIsWorking" TEXT NOT NULL DEFAULT '',
    "whatIsNot" TEXT NOT NULL DEFAULT '',
    "currentTools" TEXT NOT NULL DEFAULT '',
    "teamSituation" TEXT NOT NULL DEFAULT '',
    "contentPlatforms" TEXT NOT NULL DEFAULT '',
    "workingHoursPerWeek" INTEGER,
    "energyLevel" INTEGER,
    "biggestPersonalBlock" TEXT NOT NULL DEFAULT '',
    "goalOne" TEXT NOT NULL DEFAULT '',
    "goalTwo" TEXT NOT NULL DEFAULT '',
    "goalThree" TEXT NOT NULL DEFAULT '',
    "successIn6Months" TEXT NOT NULL DEFAULT '',
    "personalStory" TEXT NOT NULL DEFAULT '',
    "clientsFeedback" TEXT NOT NULL DEFAULT '',
    "industryBelief" TEXT NOT NULL DEFAULT '',
    "dailyRoutine" TEXT NOT NULL DEFAULT '',
    "mostProudOf" TEXT NOT NULL DEFAULT '',
    "submittedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BusinessContextIntake_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BusinessContextIntake" ("clientProfileId", "createdAt", "currentRevenue", "id", "revenueGoal", "submittedAt", "updatedAt") SELECT "clientProfileId", "createdAt", coalesce("currentRevenue", '') AS "currentRevenue", "id", coalesce("revenueGoal", '') AS "revenueGoal", "submittedAt", "updatedAt" FROM "BusinessContextIntake";
DROP TABLE "BusinessContextIntake";
ALTER TABLE "new_BusinessContextIntake" RENAME TO "BusinessContextIntake";
CREATE UNIQUE INDEX "BusinessContextIntake_clientProfileId_key" ON "BusinessContextIntake"("clientProfileId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
