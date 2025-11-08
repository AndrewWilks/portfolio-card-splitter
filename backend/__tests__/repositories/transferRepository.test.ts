import { assertEquals, assertRejects } from "@std/assert";
import { db } from "../../db/db.client.ts";
import { transfers, users, pots } from "../../db/db.schema.ts";
import { withTestDB } from "../testHelpers.ts";
import type { Cents } from "@shared/types";

Deno.test({
  name: "TransferRepository - insert cash-out transfer (fromPotId set, toPotId null)",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      // First, create test user and pot
      const [user] = await db
        .insert(users)
        .values({
          email: "test@example.com",
          passwordHash: "hash",
          firstName: "Test",
          lastName: "User",
        })
        .returning();

      const [pot] = await db
        .insert(pots)
        .values({
          name: "Test Pot",
          type: "solo",
          ownerId: user.id,
        })
        .returning();

      // Insert cash-out transfer (fromPotId set, toPotId null)
      const [transfer] = await db
        .insert(transfers)
        .values({
          fromPotId: pot.id,
          toPotId: null,
          amountCents: 5000 as Cents,
        })
        .returning();

      assertEquals(transfer.fromPotId, pot.id);
      assertEquals(transfer.toPotId, null);
      assertEquals(transfer.amountCents, 5000);
    });
  },
});

Deno.test({
  name: "TransferRepository - insert cash-in transfer (toPotId set, fromPotId null)",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      // Create test user and pot
      const [user] = await db
        .insert(users)
        .values({
          email: "test2@example.com",
          passwordHash: "hash",
          firstName: "Test",
          lastName: "User",
        })
        .returning();

      const [pot] = await db
        .insert(pots)
        .values({
          name: "Test Pot",
          type: "solo",
          ownerId: user.id,
        })
        .returning();

      // Insert cash-in transfer (toPotId set, fromPotId null)
      const [transfer] = await db
        .insert(transfers)
        .values({
          fromPotId: null,
          toPotId: pot.id,
          amountCents: 7500 as Cents,
        })
        .returning();

      assertEquals(transfer.fromPotId, null);
      assertEquals(transfer.toPotId, pot.id);
      assertEquals(transfer.amountCents, 7500);
    });
  },
});

Deno.test({
  name: "TransferRepository - insert pot-to-pot transfer (both IDs set)",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      // Create test user and pots
      const [user] = await db
        .insert(users)
        .values({
          email: "test3@example.com",
          passwordHash: "hash",
          firstName: "Test",
          lastName: "User",
        })
        .returning();

      const [pot1] = await db
        .insert(pots)
        .values({
          name: "From Pot",
          type: "solo",
          ownerId: user.id,
        })
        .returning();

      const [pot2] = await db
        .insert(pots)
        .values({
          name: "To Pot",
          type: "solo",
          ownerId: user.id,
        })
        .returning();

      // Insert pot-to-pot transfer
      const [transfer] = await db
        .insert(transfers)
        .values({
          fromPotId: pot1.id,
          toPotId: pot2.id,
          amountCents: 10000 as Cents,
        })
        .returning();

      assertEquals(transfer.fromPotId, pot1.id);
      assertEquals(transfer.toPotId, pot2.id);
      assertEquals(transfer.amountCents, 10000);
    });
  },
});

Deno.test({
  name: "TransferRepository - reject transfer with both pot IDs null (constraint violation)",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      // Attempt to insert transfer with both pot IDs null - should fail with constraint violation
      await assertRejects(
        async () => {
          await db
            .insert(transfers)
            .values({
              fromPotId: null,
              toPotId: null,
              amountCents: 1000 as Cents,
            })
            .returning();
        },
        Error
        // PostgreSQL error will mention the constraint name or "violates check constraint"
      );
    });
  },
});
