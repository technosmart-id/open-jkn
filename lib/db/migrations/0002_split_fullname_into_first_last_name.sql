-- Split fullName into firstName and lastName for participant and family_member tables
-- This migration aligns the database schema with the Drizzle ORM schema

-- Fix participant table
-- Add firstName and lastName columns
ALTER TABLE "participant" ADD COLUMN "firstName" varchar(100);
ALTER TABLE "participant" ADD COLUMN "lastName" varchar(100);

-- Migrate data from fullName to firstName + lastName
-- Split on space, first word is firstName, rest is lastName
UPDATE "participant"
SET
  "firstName" = COALESCE(SPLIT_PART("fullName", ' ', 1), "fullName"),
  "lastName" = CASE
    WHEN array_length(string_to_array("fullName", ' '), 1) > 1
      THEN SUBSTRING("fullName", STRPOS("fullName", ' ') + 1)
    ELSE NULL
  END;

-- Make firstName NOT NULL after migration
ALTER TABLE "participant" ALTER COLUMN "firstName" SET NOT NULL;

-- Drop the old fullName column
ALTER TABLE "participant" DROP COLUMN "fullName";

-- Fix family_member table
-- Add firstName and lastName columns
ALTER TABLE "family_member" ADD COLUMN "firstName" text;
ALTER TABLE "family_member" ADD COLUMN "lastName" text;

-- Migrate data from fullName to firstName + lastName
UPDATE "family_member"
SET
  "firstName" = COALESCE(SPLIT_PART("fullName", ' ', 1), "fullName"),
  "lastName" = CASE
    WHEN array_length(string_to_array("fullName", ' '), 1) > 1
      THEN SUBSTRING("fullName", STRPOS("fullName", ' ') + 1)
    ELSE NULL
  END;

-- Make firstName NOT NULL after migration
ALTER TABLE "family_member" ALTER COLUMN "firstName" SET NOT NULL;

-- Drop the old fullName column
ALTER TABLE "family_member" DROP COLUMN "fullName";
