/*
  Warnings:

  - The primary key for the `UserToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `UserToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserToken" DROP CONSTRAINT "UserToken_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL,
ADD CONSTRAINT "UserToken_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "WinCode" ALTER COLUMN "userId" DROP NOT NULL;
