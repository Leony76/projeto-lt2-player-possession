/*
  Warnings:

  - The values [PLANK,EVENT] on the enum `ItemSubcategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ItemSubcategory_new" AS ENUM ('WOOD', 'AXE', 'GIFT', 'LOGIC', 'MISC');
ALTER TABLE "items" ALTER COLUMN "subcategory" TYPE "ItemSubcategory_new" USING ("subcategory"::text::"ItemSubcategory_new");
ALTER TYPE "ItemSubcategory" RENAME TO "ItemSubcategory_old";
ALTER TYPE "ItemSubcategory_new" RENAME TO "ItemSubcategory";
DROP TYPE "public"."ItemSubcategory_old";
COMMIT;
