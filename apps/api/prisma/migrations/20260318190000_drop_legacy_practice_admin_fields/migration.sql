-- DropIndex
DROP INDEX IF EXISTS "Practice_adminEmail_key";

-- DropIndex
DROP INDEX IF EXISTS "Practice_adminSessionToken_key";

-- DropIndex
DROP INDEX IF EXISTS "Practice_adminTherapistId_key";

-- SQLite does not support dropping columns directly.
-- We recreate the table without the legacy admin fields.

CREATE TABLE "Practice_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "hours" TEXT,
    "lat" REAL NOT NULL DEFAULT 0,
    "lng" REAL NOT NULL DEFAULT 0,
    "reviewStatus" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "description" TEXT,
    "inviteToken" TEXT,
    "logo" TEXT,
    "photos" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "Practice_new"
  ("id","name","city","address","phone","hours","lat","lng","reviewStatus","description","inviteToken","logo","photos","createdAt","updatedAt")
SELECT
  "id","name","city","address","phone","hours","lat","lng","reviewStatus","description","inviteToken","logo","photos","createdAt","updatedAt"
FROM "Practice";

DROP TABLE "Practice";
ALTER TABLE "Practice_new" RENAME TO "Practice";

-- CreateIndex
CREATE UNIQUE INDEX "Practice_inviteToken_key" ON "Practice"("inviteToken");
