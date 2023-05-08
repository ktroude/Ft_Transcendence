/*
  Warnings:

  - You are about to drop the column `SecretAchievement` on the `user` table. All the data in the column will be lost.
  - The `ImCurious` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `ImTheBoss` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `TheDarkSide` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `WinStreak` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `FirstLoss` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `FirstWin` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `ImBad` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "SecretAchievement",
ADD COLUMN     "SecretBoolean" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "ImCurious",
ADD COLUMN     "ImCurious" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "ImTheBoss",
ADD COLUMN     "ImTheBoss" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "TheDarkSide",
ADD COLUMN     "TheDarkSide" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "WinStreak",
ADD COLUMN     "WinStreak" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "FirstLoss",
ADD COLUMN     "FirstLoss" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "FirstWin",
ADD COLUMN     "FirstWin" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "ImBad",
ADD COLUMN     "ImBad" BOOLEAN NOT NULL DEFAULT false;

-- DropEnum
DROP TYPE "Achievement";
