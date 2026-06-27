-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "location" TEXT,
ADD COLUMN     "notificationPrefs" JSONB,
ADD COLUMN     "phone" TEXT;
