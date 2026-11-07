/*
  Warnings:

  - You are about to drop the `friendships` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "friendships" DROP CONSTRAINT "friendships_addressee_id_fkey";

-- DropForeignKey
ALTER TABLE "friendships" DROP CONSTRAINT "friendships_requester_id_fkey";

-- DropTable
DROP TABLE "friendships";

-- CreateTable
CREATE TABLE "contacts" (
    "id" SERIAL NOT NULL,
    "requester_id" INTEGER NOT NULL,
    "addressee_id" INTEGER NOT NULL,
    "status" "ContactStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contacts_requester_id_status_idx" ON "contacts"("requester_id", "status");

-- CreateIndex
CREATE INDEX "contacts_addressee_id_status_idx" ON "contacts"("addressee_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_requester_id_addressee_id_key" ON "contacts"("requester_id", "addressee_id");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_addressee_id_fkey" FOREIGN KEY ("addressee_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
