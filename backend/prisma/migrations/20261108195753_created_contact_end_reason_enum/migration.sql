-- CreateEnum
CREATE TYPE "ContactEndReason" AS ENUM ('CANCELLED', 'DENIED', 'REMOVED');

-- AlterTable
ALTER TABLE "contacts" ADD COLUMN     "endReason" "ContactEndReason";
