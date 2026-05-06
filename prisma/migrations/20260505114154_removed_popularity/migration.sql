/*
  Warnings:

  - You are about to drop the column `isNewArticle` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `popularity` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "isNewArticle",
DROP COLUMN "popularity";
