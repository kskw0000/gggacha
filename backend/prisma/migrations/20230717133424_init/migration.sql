-- CreateTable
CREATE TABLE "GachaSetting" (
    "id" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "rolls" INTEGER NOT NULL,
    "winProbability" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "GachaSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WinCode" (
    "winCode" TEXT NOT NULL,
    "issuedAt" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "WinCode_pkey" PRIMARY KEY ("winCode")
);

-- CreateTable
CREATE TABLE "UserToken" (
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,

    CONSTRAINT "UserToken_pkey" PRIMARY KEY ("userId")
);
