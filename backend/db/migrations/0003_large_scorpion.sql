ALTER TABLE "reservations" ADD COLUMN "allocation_id" uuid;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "member_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_allocation_id_allocations_id_fk" FOREIGN KEY ("allocation_id") REFERENCES "public"."allocations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_reservations_allocation_id" ON "reservations" USING btree ("allocation_id");--> statement-breakpoint
CREATE INDEX "idx_reservations_member_id" ON "reservations" USING btree ("member_id");