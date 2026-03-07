-- CreateTable "CecBooking"
CREATE TABLE "CecBooking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cecType" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CecBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CecBooking_userId_idx" ON "CecBooking"("userId");

-- CreateIndex
CREATE INDEX "CecBooking_cecType_idx" ON "CecBooking"("cecType");

-- CreateIndex
CREATE INDEX "CecBooking_status_idx" ON "CecBooking"("status");

-- CreateIndex
CREATE INDEX "CecBooking_startTime_idx" ON "CecBooking"("startTime");

-- CreateIndex
CREATE INDEX "CecBooking_endTime_idx" ON "CecBooking"("endTime");

-- AddForeignKey
ALTER TABLE "CecBooking" ADD CONSTRAINT "CecBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CecBooking" ADD CONSTRAINT "CecBooking_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
