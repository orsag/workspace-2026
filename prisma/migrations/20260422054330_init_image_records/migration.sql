-- CreateTable
CREATE TABLE "ImageRecord" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImageRecord_pkey" PRIMARY KEY ("id")
);
