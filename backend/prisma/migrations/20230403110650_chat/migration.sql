/*
  Warnings:

  - Added the required column `senderPseudo` to the `message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "message" ADD COLUMN     "senderPseudo" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "chat_room" ADD CONSTRAINT "chat_room_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
