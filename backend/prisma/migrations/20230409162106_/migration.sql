/*
  Warnings:

  - A unique constraint covering the columns `[ownerId]` on the table `chat_room` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "chat_room_ownerId_key" ON "chat_room"("ownerId");
