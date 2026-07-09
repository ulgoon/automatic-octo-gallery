/*
  Warnings:

  - You are about to drop the column `trashRelPath` on the `Photo` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Photo" (
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
    "originalRelPath" TEXT,
    "title" TEXT,
    "caption" TEXT,
    "takenAt" DATETIME,
    "location" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Photo" ("caption", "contentHash", "createdAt", "deletedAt", "filename", "height", "id", "location", "mtimeMs", "relPath", "size", "takenAt", "thumbStatus", "title", "updatedAt", "width") SELECT "caption", "contentHash", "createdAt", "deletedAt", "filename", "height", "id", "location", "mtimeMs", "relPath", "size", "takenAt", "thumbStatus", "title", "updatedAt", "width" FROM "Photo";
DROP TABLE "Photo";
ALTER TABLE "new_Photo" RENAME TO "Photo";
CREATE UNIQUE INDEX "Photo_relPath_key" ON "Photo"("relPath");
CREATE INDEX "Photo_deletedAt_idx" ON "Photo"("deletedAt");
CREATE INDEX "Photo_contentHash_idx" ON "Photo"("contentHash");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
