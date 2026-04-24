-- AlterTable
ALTER TABLE "User" ADD COLUMN     "creditsLastAllocatedAt" TIMESTAMP(3),
ADD COLUMN     "currentPlan" TEXT NOT NULL DEFAULT 'free',
ALTER COLUMN "creditRate" SET DEFAULT 1;
