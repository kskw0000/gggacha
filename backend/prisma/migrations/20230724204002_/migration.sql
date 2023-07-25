/*
  Warnings:

  - The primary key for the `UserToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `UserToken` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `UserToken` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "UserToken_userId_key";

-- AlterTable
ALTER TABLE "UserToken" DROP CONSTRAINT "UserToken_pkey",
DROP COLUMN "id",
DROP COLUMN "updatedAt",
ADD CONSTRAINT "UserToken_pkey" PRIMARY KEY ("userId");
