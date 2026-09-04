-- Add role-based access without removing existing users or task assignments.
ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'MEMBER';

-- Promote Nathan when available; otherwise promote the oldest existing account.
UPDATE "User"
SET "role" = 'ADMIN'
WHERE "id" = (
  SELECT "id"
  FROM "User"
  ORDER BY ("email" = 'nathan@taskflow.dev') DESC, "id" ASC
  LIMIT 1
);
