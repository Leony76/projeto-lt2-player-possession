/*
  Warnings:

  - The values [WOBBLE_BOBBLES] on the enum `ItemCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ItemCategory_new" AS ENUM ('AXE', 'BALL', 'BOOK', 'CANDY', 'CANDY_CANE', 'FOOD', 'FINE_ART', 'GAME', 'HOME', 'PUMPKIN', 'WOBBLE_BOBBLE', 'VEHICLE', 'MISCELLANEOUS', 'LOGIC', 'CONVEYOR', 'WOOD');
ALTER TABLE "items" ALTER COLUMN "category" TYPE "ItemCategory_new" USING ("category"::text::"ItemCategory_new");
ALTER TYPE "ItemCategory" RENAME TO "ItemCategory_old";
ALTER TYPE "ItemCategory_new" RENAME TO "ItemCategory";
DROP TYPE "public"."ItemCategory_old";
COMMIT;
