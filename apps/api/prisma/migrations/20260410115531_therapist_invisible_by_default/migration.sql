-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorName" TEXT NOT NULL DEFAULT 'Revio Team',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Therapist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "fullName" TEXT NOT NULL,
    "professionalTitle" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT,
    "street" TEXT,
    "houseNumber" TEXT,
    "locationPrecision" TEXT NOT NULL DEFAULT 'approximate',
    "bio" TEXT,
    "homeVisit" BOOLEAN NOT NULL DEFAULT false,
    "isFreelancer" BOOLEAN NOT NULL DEFAULT true,
    "specializations" TEXT NOT NULL,
    "languages" TEXT NOT NULL,
    "certifications" TEXT NOT NULL DEFAULT '',
    "kassenart" TEXT NOT NULL DEFAULT '',
    "availability" TEXT NOT NULL DEFAULT '',
    "serviceRadiusKm" REAL,
    "latitude" REAL,
    "longitude" REAL,
    "homeLat" REAL NOT NULL DEFAULT 0,
    "homeLng" REAL NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT false,
    "reviewStatus" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "passwordHash" TEXT,
    "sessionToken" TEXT,
    "photo" TEXT,
    "expoPushToken" TEXT,
    "taxRegistrationStatus" TEXT,
    "healthAuthorityStatus" TEXT,
    "complianceUpdatedAt" DATETIME,
    "invitedByPracticeId" TEXT,
    "onboardingStatus" TEXT NOT NULL DEFAULT 'none',
    "visibilityPreference" TEXT NOT NULL DEFAULT 'hidden',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "bookingMode" TEXT NOT NULL DEFAULT 'DIRECTORY_ONLY',
    "nextFreeSlotAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Therapist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Therapist" ("availability", "bio", "bookingMode", "certifications", "city", "complianceUpdatedAt", "createdAt", "email", "expoPushToken", "fullName", "healthAuthorityStatus", "homeLat", "homeLng", "homeVisit", "houseNumber", "id", "invitedByPracticeId", "isPublished", "isVisible", "kassenart", "languages", "latitude", "locationPrecision", "longitude", "nextFreeSlotAt", "onboardingStatus", "passwordHash", "photo", "postalCode", "professionalTitle", "reviewStatus", "serviceRadiusKm", "sessionToken", "specializations", "street", "taxRegistrationStatus", "updatedAt", "userId", "visibilityPreference") SELECT "availability", "bio", "bookingMode", "certifications", "city", "complianceUpdatedAt", "createdAt", "email", "expoPushToken", "fullName", "healthAuthorityStatus", "homeLat", "homeLng", "homeVisit", "houseNumber", "id", "invitedByPracticeId", "isPublished", "isVisible", "kassenart", "languages", "latitude", "locationPrecision", "longitude", "nextFreeSlotAt", "onboardingStatus", "passwordHash", "photo", "postalCode", "professionalTitle", "reviewStatus", "serviceRadiusKm", "sessionToken", "specializations", "street", "taxRegistrationStatus", "updatedAt", "userId", "visibilityPreference" FROM "Therapist";
DROP TABLE "Therapist";
ALTER TABLE "new_Therapist" RENAME TO "Therapist";
CREATE UNIQUE INDEX "Therapist_email_key" ON "Therapist"("email");
CREATE UNIQUE INDEX "Therapist_userId_key" ON "Therapist"("userId");
CREATE UNIQUE INDEX "Therapist_sessionToken_key" ON "Therapist"("sessionToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "AppSetting_key_key" ON "AppSetting"("key");
