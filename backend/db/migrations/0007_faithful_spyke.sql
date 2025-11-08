ALTER TABLE "invite_tokens" ALTER COLUMN "expires_at" SET DEFAULT '2025-11-15T02:31:57.585Z';--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ALTER COLUMN "expires_at" SET DEFAULT '2025-11-15T02:31:57.585Z';--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "needs_reconciliation" boolean DEFAULT false NOT NULL;