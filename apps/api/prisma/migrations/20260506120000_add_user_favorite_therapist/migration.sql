-- CreateTable
CREATE TABLE "UserFavoriteTherapist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "therapistId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserFavoriteTherapist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserFavoriteTherapist_therapistId_fkey" FOREIGN KEY ("therapistId") REFERENCES "Therapist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "UserFavoriteTherapist_userId_idx" ON "UserFavoriteTherapist"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserFavoriteTherapist_userId_therapistId_key" ON "UserFavoriteTherapist"("userId", "therapistId");
