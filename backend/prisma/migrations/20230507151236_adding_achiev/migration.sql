/*
  Warnings:

  - You are about to drop the column `firstLoss` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `firstWin` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "firstLoss",
DROP COLUMN "firstWin",
ADD COLUMN     "FirstLoss" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "FirstWin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ImBad" BOOLEAN NOT NULL DEFAULT false;
