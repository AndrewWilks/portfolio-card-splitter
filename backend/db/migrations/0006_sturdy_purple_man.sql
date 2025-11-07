-- Create card_accounts table
CREATE TABLE "card_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"issuer" text NOT NULL,
	"last4" text NOT NULL,
	"billing_cycle" integer NOT NULL,
	"credit_limit_cents" bigint,
	"owner_id" uuid NOT NULL
);
--> statement-breakpoint
-- Create card_account_settings table (one-to-one with card_accounts)
CREATE TABLE "card_account_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"card_account_id" uuid NOT NULL,
	"statement_close_day_of_month" integer DEFAULT 15 NOT NULL,
	"statement_frequency_days" integer DEFAULT 30 NOT NULL,
	"payment_due_days_after_close" integer DEFAULT 21 NOT NULL,
	"interest_free_days" integer DEFAULT 55 NOT NULL,
	"has_interest_free_period" boolean DEFAULT true NOT NULL,
	"minimum_payment_percentage" numeric(5, 2) DEFAULT '2.00' NOT NULL,
	"minimum_payment_floor_cents" bigint DEFAULT 2500 NOT NULL,
	"reminder_days_before_due" integer DEFAULT 3 NOT NULL,
	CONSTRAINT "card_account_settings_card_account_id_unique" UNIQUE("card_account_id")
);
--> statement-breakpoint
-- Create cards table
CREATE TABLE "cards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"card_account_id" uuid NOT NULL,
	"member_id" uuid,
	"nickname" text,
	"last4" text
);
--> statement-breakpoint
-- Update token expiry defaults
ALTER TABLE "invite_tokens" ALTER COLUMN "expires_at" SET DEFAULT '2025-11-14T10:31:39.410Z';--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ALTER COLUMN "expires_at" SET DEFAULT '2025-11-14T10:31:39.410Z';--> statement-breakpoint
-- Add foreign key constraints for new tables
ALTER TABLE "card_accounts" ADD CONSTRAINT "card_accounts_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_account_settings" ADD CONSTRAINT "card_account_settings_card_account_id_card_accounts_id_fk" FOREIGN KEY ("card_account_id") REFERENCES "public"."card_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_card_account_id_card_accounts_id_fk" FOREIGN KEY ("card_account_id") REFERENCES "public"."card_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
-- Data migration: Create legacy CardAccount for existing transactions
DO $$
DECLARE
  legacy_card_account_id UUID;
  first_user_id UUID;
  transaction_count INTEGER;
BEGIN
  -- Check if there are any existing transactions
  SELECT COUNT(*) INTO transaction_count FROM transactions;
  
  IF transaction_count > 0 THEN
    -- Get first user to own the legacy account
    SELECT id INTO first_user_id FROM users ORDER BY created_at LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
      -- Create legacy CardAccount
      INSERT INTO card_accounts (name, issuer, last4, billing_cycle, owner_id, is_active, created_at, updated_at)
      VALUES ('Legacy Account', 'Unknown', '0000', 1, first_user_id, true, NOW(), NOW())
      RETURNING id INTO legacy_card_account_id;
      
      -- Create default settings for legacy account
      INSERT INTO card_account_settings (card_account_id, created_at, updated_at)
      VALUES (legacy_card_account_id, NOW(), NOW());
      
      RAISE NOTICE 'Created legacy CardAccount (%) with settings for % existing transactions', legacy_card_account_id, transaction_count;
    ELSE
      RAISE EXCEPTION 'No users found. Cannot create legacy CardAccount for existing transactions.';
    END IF;
  ELSE
    RAISE NOTICE 'No existing transactions. Skipping legacy CardAccount creation.';
  END IF;
END $$;
--> statement-breakpoint
-- Add card reference columns to transactions (nullable first for data migration)
ALTER TABLE "transactions" ADD COLUMN "card_account_id" uuid;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "card_id" uuid;--> statement-breakpoint
-- Migrate existing transactions to legacy CardAccount
DO $$
DECLARE
  legacy_card_account_id UUID;
  updated_count INTEGER;
BEGIN
  -- Find the legacy account (if it exists)
  SELECT id INTO legacy_card_account_id FROM card_accounts WHERE name = 'Legacy Account';
  
  IF legacy_card_account_id IS NOT NULL THEN
    -- Assign all transactions without a card_account_id to the legacy account
    UPDATE transactions
    SET card_account_id = legacy_card_account_id
    WHERE card_account_id IS NULL;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Assigned % transactions to legacy CardAccount', updated_count;
  END IF;
END $$;
--> statement-breakpoint
-- Make card_account_id NOT NULL after data migration
ALTER TABLE "transactions" ALTER COLUMN "card_account_id" SET NOT NULL;--> statement-breakpoint
-- Add foreign key constraints for transaction card references
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_card_account_id_card_accounts_id_fk" FOREIGN KEY ("card_account_id") REFERENCES "public"."card_accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE set null ON UPDATE no action;