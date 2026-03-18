-- CreateTable
CREATE TABLE "PracticeManager" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "sessionToken" TEXT,
    "practiceId" TEXT NOT NULL,
    "therapistId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PracticeManager_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "Practice" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PracticeManager_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PracticeManager_email_key" ON "PracticeManager"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeManager_sessionToken_key" ON "PracticeManager"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeManager_practiceId_key" ON "PracticeManager"("practiceId");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeManager_therapistId_key" ON "PracticeManager"("therapistId");
