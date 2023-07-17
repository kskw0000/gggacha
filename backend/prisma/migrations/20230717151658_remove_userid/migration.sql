/*
  Warnings:

  - The primary key for the `UserToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `UserToken` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `WinCode` table. All the data in the column will be lost.
  - Added the required column `id` to the `UserToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserToken" DROP CONSTRAINT "UserToken_pkey",
DROP COLUMN "userId",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "UserToken_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "WinCode" DROP COLUMN "userId";
