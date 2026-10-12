-- CreateTable
CREATE TABLE "WeeklyScorecard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientProfileId" TEXT NOT NULL,
    "weekStart" DATETIME NOT NULL,
    "revenue" REAL,
    "leads" INTEGER,
    "callsBooked" INTEGER,
    "callsConverted" INTEGER,
    "contentPieces" INTEGER,
    "hoursWorked" REAL,
    "energyScore" INTEGER,
    "contentEnquiries" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WeeklyScorecard_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScorecardTargets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientProfileId" TEXT NOT NULL,
    "revenueTarget" REAL NOT NULL DEFAULT 5000,
    "leadsTarget" INTEGER NOT NULL DEFAULT 5,
    "callsBookedTarget" INTEGER NOT NULL DEFAULT 3,
    "callsConvertedTarget" INTEGER NOT NULL DEFAULT 1,
    "contentTarget" INTEGER NOT NULL DEFAULT 5,
    "hoursTarget" REAL NOT NULL DEFAULT 40,
    "energyTarget" INTEGER NOT NULL DEFAULT 7,
    "monthlyRevenueTarget" REAL NOT NULL DEFAULT 20000,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScorecardTargets_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonthlyExpense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clientProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MonthlyExpense_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyScorecard_clientProfileId_weekStart_key" ON "WeeklyScorecard"("clientProfileId", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "ScorecardTargets_clientProfileId_key" ON "ScorecardTargets"("clientProfileId");
