-- CreateTable
CREATE TABLE "direct_message" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerOneId" INTEGER NOT NULL,
    "ownerTwoId" INTEGER NOT NULL,

    CONSTRAINT "direct_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DirectMessage" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "senderId" INTEGER NOT NULL,
    "senderPseudo" TEXT NOT NULL,
    "directMessageRoomId" INTEGER NOT NULL,

    CONSTRAINT "DirectMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "direct_message" ADD CONSTRAINT "direct_message_ownerOneId_fkey" FOREIGN KEY ("ownerOneId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_message" ADD CONSTRAINT "direct_message_ownerTwoId_fkey" FOREIGN KEY ("ownerTwoId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_directMessageRoomId_fkey" FOREIGN KEY ("directMessageRoomId") REFERENCES "direct_message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
