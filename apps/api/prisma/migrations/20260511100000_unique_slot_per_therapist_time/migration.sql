-- CreateUniqueIndex: prevent duplicate slots at same time for same therapist
CREATE UNIQUE INDEX "TherapistSlot_therapistId_startsAt_key" ON "TherapistSlot"("therapistId", "startsAt");
