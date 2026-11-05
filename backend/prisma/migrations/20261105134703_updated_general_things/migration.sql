/*
  Warnings:

  - You are about to drop the column `market_price` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `releasedAt` on the `items` table. All the data in the column will be lost.
  - You are about to drop the column `units` on the `items` table. All the data in the column will be lost.
  - You are about to drop the `_UserItems` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `average_market_price` to the `items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `average_truckload_price` to the `items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `release_year` to the `items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ItemCategory" ADD VALUE 'LOGIC';
ALTER TYPE "ItemCategory" ADD VALUE 'CONVEYOR';
ALTER TYPE "ItemCategory" ADD VALUE 'WOOD';

-- DropForeignKey
ALTER TABLE "_UserItems" DROP CONSTRAINT "_UserItems_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserItems" DROP CONSTRAINT "_UserItems_B_fkey";

-- AlterTable
ALTER TABLE "items" DROP COLUMN "market_price",
DROP COLUMN "releasedAt",
DROP COLUMN "units",
ADD COLUMN     "average_market_price" INTEGER NOT NULL,
ADD COLUMN     "average_truckload_price" INTEGER NOT NULL,
ADD COLUMN     "release_year" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_UserItems";

-- CreateTable
CREATE TABLE "user_items" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "units" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_items_user_id_item_id_key" ON "user_items"("user_id", "item_id");

-- AddForeignKey
ALTER TABLE "user_items" ADD CONSTRAINT "user_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_items" ADD CONSTRAINT "user_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
