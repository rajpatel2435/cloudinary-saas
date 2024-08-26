/*
  Warnings:

  - Added the required column `compressedSize` to the `Video` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "compressedSize" TEXT NOT NULL;
