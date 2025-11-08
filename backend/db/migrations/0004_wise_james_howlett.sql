ALTER TABLE "allocations" ALTER COLUMN "rule" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."allocation_rule";--> statement-breakpoint
CREATE TYPE "public"."allocation_rule" AS ENUM('basisPoints', 'fixed_amount');--> statement-breakpoint
ALTER TABLE "allocations" ALTER COLUMN "rule" SET DATA TYPE "public"."allocation_rule" USING "rule"::"public"."allocation_rule";