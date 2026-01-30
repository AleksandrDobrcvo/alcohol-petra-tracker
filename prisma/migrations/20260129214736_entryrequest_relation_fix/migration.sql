-- CreateTable
CREATE TABLE "EntryRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "submitterId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "stars" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "nickname" TEXT NOT NULL,
    "screenshotPath" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "decidedAt" DATETIME,
    "decisionNote" TEXT,
    "decidedById" TEXT,
    "relatedEntryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EntryRequest_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EntryRequest_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EntryRequest_relatedEntryId_fkey" FOREIGN KEY ("relatedEntryId") REFERENCES "Entry" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discordId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'VIEWER',
    "cardNumber" TEXT,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "moderatesAlco" BOOLEAN NOT NULL DEFAULT false,
    "moderatesPetra" BOOLEAN NOT NULL DEFAULT false,
    "isFrozen" BOOLEAN NOT NULL DEFAULT false,
    "frozenReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("cardNumber", "createdAt", "discordId", "id", "isApproved", "isBlocked", "name", "role", "updatedAt") SELECT "cardNumber", "createdAt", "discordId", "id", "isApproved", "isBlocked", "name", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_discordId_key" ON "User"("discordId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "EntryRequest_relatedEntryId_key" ON "EntryRequest"("relatedEntryId");

-- CreateIndex
CREATE INDEX "EntryRequest_status_idx" ON "EntryRequest"("status");

-- CreateIndex
CREATE INDEX "EntryRequest_type_idx" ON "EntryRequest"("type");

-- CreateIndex
CREATE INDEX "EntryRequest_submitterId_idx" ON "EntryRequest"("submitterId");

-- CreateIndex
CREATE INDEX "EntryRequest_decidedById_idx" ON "EntryRequest"("decidedById");
