/*
  Warnings:

  - You are about to drop the column `FirstLoss` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `ImBad` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `SecretBoolean` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "FirstLoss",
DROP COLUMN "ImBad",
DROP COLUMN "SecretBoolean";
