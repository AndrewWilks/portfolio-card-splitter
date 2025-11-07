-- Add needs_reconciliation column to payments table
ALTER TABLE "payments" ADD COLUMN "needs_reconciliation" boolean DEFAULT false NOT NULL;
