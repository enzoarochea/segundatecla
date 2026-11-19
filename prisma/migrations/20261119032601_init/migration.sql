-- CreateTable
CREATE TABLE "Laptop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "cpu" TEXT NOT NULL,
    "ramGb" INTEGER NOT NULL,
    "storageGb" INTEGER NOT NULL,
    "storageType" TEXT NOT NULL DEFAULT 'SSD',
    "screenIn" REAL NOT NULL,
    "gpu" TEXT,
    "os" TEXT NOT NULL,
    "year" INTEGER,
    "priceGtq" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    "batteryHealth" INTEGER NOT NULL,
    "uses" TEXT NOT NULL,
    "includes" TEXT NOT NULL,
    "cosmeticNotes" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "stock" INTEGER NOT NULL DEFAULT 1,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "artVariant" TEXT NOT NULL DEFAULT 'clasica',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LaptopImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "laptopId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',
    "position" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "LaptopImage_laptopId_fkey" FOREIGN KEY ("laptopId") REFERENCES "Laptop" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AdminUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Laptop_slug_key" ON "Laptop"("slug");

-- CreateIndex
CREATE INDEX "Laptop_hidden_priceGtq_idx" ON "Laptop"("hidden", "priceGtq");

-- CreateIndex
CREATE INDEX "LaptopImage_laptopId_position_idx" ON "LaptopImage"("laptopId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
