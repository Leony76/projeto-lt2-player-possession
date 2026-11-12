/*
  Warnings:

  - You are about to drop the column `endReason` on the `contacts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "contacts" DROP COLUMN "endReason";

-- AlterTable
ALTER TABLE "items" ALTER COLUMN "original_price" DROP NOT NULL;

-- DropEnum
DROP TYPE "ContactEndReason";
