-- CreateTable
CREATE TABLE "block" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "blocked_id" INTEGER NOT NULL,

    CONSTRAINT "block_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "block_user_id_blocked_id_key" ON "block"("user_id", "blocked_id");

-- AddForeignKey
ALTER TABLE "block" ADD CONSTRAINT "block_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "block" ADD CONSTRAINT "block_blocked_id_fkey" FOREIGN KEY ("blocked_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
