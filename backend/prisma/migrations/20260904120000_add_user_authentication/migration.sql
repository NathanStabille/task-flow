-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "avatar" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "new_User" ("avatar", "createdAt", "email", "id", "name", "passwordHash")
SELECT "avatar", "createdAt", "email", "id", "name", '$2b$12$nk5DNlM4GdKnQwsi76Tj2Ou/4HGu5VAXhjg6NBQG1b19odIrMEr4G' FROM "User";

DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
