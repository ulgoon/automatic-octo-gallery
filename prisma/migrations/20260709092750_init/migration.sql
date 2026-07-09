-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "rootPath" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "relPath" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mtimeMs" REAL NOT NULL,
    "contentHash" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "thumbStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "deletedAt" DATETIME,
    "trashRelPath" TEXT,
    "title" TEXT,
    "caption" TEXT,
    "takenAt" DATETIME,
    "location" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mergedFromIds" TEXT
);

-- CreateTable
CREATE TABLE "PhotoTag" (
    "photoId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("photoId", "tagId"),
    CONSTRAINT "PhotoTag_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "Photo" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PhotoTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Photo_relPath_key" ON "Photo"("relPath");

-- CreateIndex
CREATE INDEX "Photo_deletedAt_idx" ON "Photo"("deletedAt");

-- CreateIndex
CREATE INDEX "Photo_contentHash_idx" ON "Photo"("contentHash");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "PhotoTag_tagId_idx" ON "PhotoTag"("tagId");

-- CreateIndex
CREATE INDEX "PhotoTag_photoId_idx" ON "PhotoTag"("photoId");
