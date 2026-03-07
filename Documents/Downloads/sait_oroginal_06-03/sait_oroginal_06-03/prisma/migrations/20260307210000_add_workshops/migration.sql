-- CreateTable
CREATE TABLE "Workshop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "emoji" TEXT NOT NULL DEFAULT '🏭',
    "color" TEXT NOT NULL DEFAULT 'from-zinc-500 to-zinc-700',
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workshop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkshopBooking" (
    "id" TEXT NOT NULL,
    "workshopId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "position" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "startedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkshopBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Workshop_type_idx" ON "Workshop"("type");
CREATE INDEX "Workshop_isActive_idx" ON "Workshop"("isActive");
CREATE INDEX "WorkshopBooking_workshopId_status_idx" ON "WorkshopBooking"("workshopId", "status");
CREATE INDEX "WorkshopBooking_userId_idx" ON "WorkshopBooking"("userId");
CREATE INDEX "WorkshopBooking_status_idx" ON "WorkshopBooking"("status");

-- AddForeignKey
ALTER TABLE "WorkshopBooking" ADD CONSTRAINT "WorkshopBooking_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "Workshop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkshopBooking" ADD CONSTRAINT "WorkshopBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed default workshops (2 workshops: Alco and Petra)
INSERT INTO "Workshop" ("id", "name", "type", "description", "emoji", "color", "capacity", "isActive", "sortOrder", "updatedAt") VALUES
  (gen_random_uuid(), 'Алко Цех', 'ALCO', 'Цех виробництва алкоголю', '🍺', 'from-amber-500 to-orange-600', 1, true, 1, NOW()),
  (gen_random_uuid(), 'Петра Цех', 'PETRA', 'Цех видобутку петри', '🌿', 'from-emerald-500 to-green-600', 1, true, 2, NOW());
