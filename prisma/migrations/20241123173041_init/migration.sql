-- CreateTable
CREATE TABLE "MikuziLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "customTransactionId" TEXT NOT NULL,
    "transactionId" INTEGER,
    "message" TEXT NOT NULL,

    CONSTRAINT "MikuziLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Status" (
    "id" TEXT NOT NULL,
    "latestTransactionId" INTEGER NOT NULL,

    CONSTRAINT "Status_pkey" PRIMARY KEY ("id")
);
