/*
  Warnings:

  - You are about to drop the column `status` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "status",
ADD COLUMN     "connected" INTEGER NOT NULL DEFAULT 0;
