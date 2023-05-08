/*
  Warnings:

  - The `ImCurious` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `ImTheBoss` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `SecretAchievement` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `TheDarkSide` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `WinStreak` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `FirstLoss` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `FirstWin` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `ImBad` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Achievement" AS ENUM ('true', 'false');

-- AlterTable
ALTER TABLE "user" DROP COLUMN "ImCurious",
ADD COLUMN     "ImCurious" "Achievement" NOT NULL DEFAULT 'false',
DROP COLUMN "ImTheBoss",
ADD COLUMN     "ImTheBoss" "Achievement" NOT NULL DEFAULT 'false',
DROP COLUMN "SecretAchievement",
ADD COLUMN     "SecretAchievement" "Achievement" NOT NULL DEFAULT 'false',
DROP COLUMN "TheDarkSide",
ADD COLUMN     "TheDarkSide" "Achievement" NOT NULL DEFAULT 'false',
DROP COLUMN "WinStreak",
ADD COLUMN     "WinStreak" "Achievement" NOT NULL DEFAULT 'false',
DROP COLUMN "FirstLoss",
ADD COLUMN     "FirstLoss" "Achievement" NOT NULL DEFAULT 'false',
DROP COLUMN "FirstWin",
ADD COLUMN     "FirstWin" "Achievement" NOT NULL DEFAULT 'false',
DROP COLUMN "ImBad",
ADD COLUMN     "ImBad" "Achievement" NOT NULL DEFAULT 'false';
