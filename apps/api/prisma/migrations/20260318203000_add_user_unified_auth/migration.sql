-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "sessionToken" TEXT,
    "role" TEXT NOT NULL DEFAULT 'therapist',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_sessionToken_key" ON "User"("sessionToken");

-- AddColumn
ALTER TABLE "Therapist" ADD COLUMN "userId" TEXT;

-- AddColumn
ALTER TABLE "PracticeManager" ADD COLUMN "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Therapist_userId_key" ON "Therapist"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeManager_userId_key" ON "PracticeManager"("userId");

-- Backfill users from therapists that already have credentials
INSERT INTO "User" ("id", "email", "passwordHash", "sessionToken", "role", "createdAt", "updatedAt")
SELECT
  lower(hex(randomblob(16))),
  t."email",
  t."passwordHash",
  t."sessionToken",
  'therapist',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Therapist" t
WHERE t."passwordHash" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "User" u WHERE u."email" = t."email");

-- Backfill users from managers that do not exist yet
INSERT INTO "User" ("id", "email", "passwordHash", "sessionToken", "role", "createdAt", "updatedAt")
SELECT
  lower(hex(randomblob(16))),
  m."email",
  m."passwordHash",
  m."sessionToken",
  'manager',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "PracticeManager" m
WHERE NOT EXISTS (SELECT 1 FROM "User" u WHERE u."email" = m."email");

-- If both manager and therapist share one email, manager role wins
UPDATE "User"
SET "role" = 'manager'
WHERE "email" IN (SELECT "email" FROM "PracticeManager");

-- Link therapist and manager profiles to users
UPDATE "Therapist"
SET "userId" = (SELECT u."id" FROM "User" u WHERE u."email" = "Therapist"."email")
WHERE "userId" IS NULL
  AND EXISTS (SELECT 1 FROM "User" u WHERE u."email" = "Therapist"."email");

UPDATE "PracticeManager"
SET "userId" = (SELECT u."id" FROM "User" u WHERE u."email" = "PracticeManager"."email")
WHERE "userId" IS NULL
  AND EXISTS (SELECT 1 FROM "User" u WHERE u."email" = "PracticeManager"."email");
