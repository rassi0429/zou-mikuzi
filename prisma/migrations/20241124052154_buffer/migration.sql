-- CreateTable
CREATE TABLE "MikuziBuffer" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "message" TEXT NOT NULL,

    CONSTRAINT "MikuziBuffer_pkey" PRIMARY KEY ("id")
);
