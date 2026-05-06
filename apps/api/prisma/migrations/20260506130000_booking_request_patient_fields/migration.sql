-- Add patientUserId and declinedReason to BookingRequest
ALTER TABLE "BookingRequest" ADD COLUMN "patientUserId" TEXT;
ALTER TABLE "BookingRequest" ADD COLUMN "declinedReason" TEXT;

-- Add foreign key index for patientUserId
CREATE INDEX "BookingRequest_patientUserId_status_createdAt_idx" ON "BookingRequest"("patientUserId", "status", "createdAt");

-- Add bookingRequests relation on User (no column change needed, FK is on BookingRequest side)
