ALTER TABLE "Therapist" ADD COLUMN "postalCode" TEXT;
ALTER TABLE "Therapist" ADD COLUMN "street" TEXT;
ALTER TABLE "Therapist" ADD COLUMN "houseNumber" TEXT;
ALTER TABLE "Therapist" ADD COLUMN "locationPrecision" TEXT NOT NULL DEFAULT 'approximate';
ALTER TABLE "Therapist" ADD COLUMN "latitude" REAL;
ALTER TABLE "Therapist" ADD COLUMN "longitude" REAL;
