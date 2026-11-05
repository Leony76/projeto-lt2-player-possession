/*
  Warnings:

  - The values [PLACEBLE,LOOSE] on the enum `ItemCategory` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `subcategory` on the `items` table. All the data in the column will be lost.
  - Added the required column `releasedAt` to the `items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `items` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ItemState" AS ENUM ('GIFT', 'BOXED', 'LOOSE');

-- AlterEnum
BEGIN;
CREATE TYPE "ItemCategory_new" AS ENUM ('AXE', 'BALL', 'BOOK', 'CANDY', 'CANDY_CANE', 'FOOD', 'FINE_ART', 'GAME', 'HOME', 'PUMPKIN', 'WOBBLE_BOBBLES', 'VEHICLE', 'MISCELLANEOUS');
ALTER TABLE "items" ALTER COLUMN "category" TYPE "ItemCategory_new" USING ("category"::text::"ItemCategory_new");
ALTER TYPE "ItemCategory" RENAME TO "ItemCategory_old";
ALTER TYPE "ItemCategory_new" RENAME TO "ItemCategory";
DROP TYPE "public"."ItemCategory_old";
COMMIT;

-- AlterTable
ALTER TABLE "items" DROP COLUMN "subcategory",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "releasedAt" INTEGER NOT NULL,
ADD COLUMN     "state" "ItemState" NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- DropEnum
DROP TYPE "ItemSubcategory";
