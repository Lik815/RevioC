-- AlterTable: add phone to User
ALTER TABLE "User" ADD COLUMN "phone" TEXT;

-- AlterTable: add phone to Therapist
ALTER TABLE "Therapist" ADD COLUMN "phone" TEXT;
