/*
  Warnings:

  - Added the required column `picture` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "picture" TEXT NOT NULL;
