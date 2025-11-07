ALTER TABLE "allocations" RENAME COLUMN "percentage" TO "basis_points";--> statement-breakpoint
ALTER TABLE "transfers" DROP CONSTRAINT "transfers_created_by_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "invite_tokens" ALTER COLUMN "expires_at" SET DEFAULT '2025-11-14T06:10:32.652Z';--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ALTER COLUMN "expires_at" SET DEFAULT '2025-11-14T06:10:32.652Z';--> statement-breakpoint
ALTER TABLE "allocations" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction_tags" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction_tags" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "transfers" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "transfers" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "members" DROP COLUMN "archived";--> statement-breakpoint
ALTER TABLE "transfers" DROP COLUMN "created_by_id";