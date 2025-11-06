ALTER TABLE "payments" RENAME COLUMN "description" TO "note";--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "pot_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "paid_on" date DEFAULT CURRENT_DATE NOT NULL;
