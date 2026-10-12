-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'all',
    "specificClientId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Resource_specificClientId_fkey" FOREIGN KEY ("specificClientId") REFERENCES "ClientProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
