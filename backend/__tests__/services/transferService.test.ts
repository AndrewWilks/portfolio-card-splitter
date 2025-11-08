import { assertEquals, assertRejects } from "@std/assert";
import { TransferService } from "../../services/transferService.ts";
import { TransferRepository, PotRepository } from "../../repositories/index.ts";
import { withTestDB } from "../testHelpers.ts";
import { db } from "../../db/db.client.ts";
import { pots, users, transfers } from "../../db/db.schema.ts";
import type { Cents } from "@shared/types";
import { eq } from "drizzle-orm";

Deno.test({
  name: "TransferService - createTransfer - cash-in success",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const transferRepo = new TransferRepository();
      const potRepo = new PotRepository();
      const service = new TransferService(transferRepo, potRepo);

      // Create test user
      const [user] = await db
        .insert(users)
        .values({
          email: "cashuser@example.com",
          passwordHash: "hash123",
          firstName: "Cash",
          lastName: "User",
        })
        .returning();

      // Create test pot
      const [pot] = await db
        .insert(pots)
        .values({
          name: "Test Cash Pot",
          type: "shared",
          ownerId: user.id,
        })
        .returning();

      // Create cash-in transfer (fromPotId = null, toPotId = pot.id)
      const transferData = {
        fromPotId: null,
        toPotId: pot.id,
        amountCents: 5000 as Cents,
        occurredOn: new Date(),
        note: "Cash deposit",
      };

      const result = await service.createTransfer(transferData);

      // Assertions
      assertEquals(result.fromPotId, null);
      assertEquals(result.toPotId, pot.id);
      assertEquals(result.amountCents, 5000 as Cents);

      // Cleanup
      await db.delete(transfers).where(eq(transfers.id, result.id));
      await db.delete(pots).where(eq(pots.id, pot.id));
      await db.delete(users).where(eq(users.id, user.id));
    });
  },
});

Deno.test({
  name: "TransferService - createTransfer - cash-out success",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const transferRepo = new TransferRepository();
      const potRepo = new PotRepository();
      const service = new TransferService(transferRepo, potRepo);

      // Create test user
      const [user] = await db
        .insert(users)
        .values({
          email: "withdrawuser@example.com",
          passwordHash: "hash123",
          firstName: "Withdraw",
          lastName: "User",
        })
        .returning();

      // Create test pot
      const [pot] = await db
        .insert(pots)
        .values({
          name: "Test Withdrawal Pot",
          type: "shared",
          ownerId: user.id,
        })
        .returning();

      // Create cash-out transfer (fromPotId = pot.id, toPotId = null)
      const transferData = {
        fromPotId: pot.id,
        toPotId: null,
        amountCents: 3000 as Cents,
        occurredOn: new Date(),
        note: "Cash withdrawal",
      };

      const result = await service.createTransfer(transferData);

      // Assertions
      assertEquals(result.fromPotId, pot.id);
      assertEquals(result.toPotId, null);
      assertEquals(result.amountCents, 3000 as Cents);

      // Cleanup
      await db.delete(transfers).where(eq(transfers.id, result.id));
      await db.delete(pots).where(eq(pots.id, pot.id));
      await db.delete(users).where(eq(users.id, user.id));
    });
  },
});

Deno.test({
  name: "TransferService - createTransfer - pot-to-pot transfer success",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const transferRepo = new TransferRepository();
      const potRepo = new PotRepository();
      const service = new TransferService(transferRepo, potRepo);

      // Create test user
      const [user] = await db
        .insert(users)
        .values({
          email: "transferuser@example.com",
          passwordHash: "hash123",
          firstName: "Transfer",
          lastName: "User",
        })
        .returning();

      // Create source pot
      const [fromPot] = await db
        .insert(pots)
        .values({
          name: "Source Pot",
          type: "shared",
          ownerId: user.id,
        })
        .returning();

      // Create destination pot
      const [toPot] = await db
        .insert(pots)
        .values({
          name: "Destination Pot",
          type: "shared",
          ownerId: user.id,
        })
        .returning();

      // Create pot-to-pot transfer
      const transferData = {
        fromPotId: fromPot.id,
        toPotId: toPot.id,
        amountCents: 7500 as Cents,
        occurredOn: new Date(),
        note: "Transfer between pots",
      };

      const result = await service.createTransfer(transferData);

      // Assertions
      assertEquals(result.fromPotId, fromPot.id);
      assertEquals(result.toPotId, toPot.id);
      assertEquals(result.amountCents, 7500 as Cents);

      // Cleanup
      await db.delete(transfers).where(eq(transfers.id, result.id));
      await db.delete(pots).where(eq(pots.id, toPot.id));
      await db.delete(pots).where(eq(pots.id, fromPot.id));
      await db.delete(users).where(eq(users.id, user.id));
    });
  },
});

Deno.test({
  name: "TransferService - createTransfer - validates source pot exists",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const transferRepo = new TransferRepository();
      const potRepo = new PotRepository();
      const service = new TransferService(transferRepo, potRepo);

      // Create test user
      const [user] = await db
        .insert(users)
        .values({
          email: "validuser@example.com",
          passwordHash: "hash123",
          firstName: "Valid",
          lastName: "User",
        })
        .returning();

      // Create destination pot only
      const [toPot] = await db
        .insert(pots)
        .values({
          name: "Destination Pot",
          type: "shared",
          ownerId: user.id,
        })
        .returning();

      // Try to create transfer with non-existent source pot
      const transferData = {
        fromPotId: "00000000-0000-0000-0000-000000000000",
        toPotId: toPot.id,
        amountCents: 1000 as Cents,
        occurredOn: new Date(),
      };

      await assertRejects(
        async () => await service.createTransfer(transferData),
        Error,
        "Source pot not found"
      );

      // Cleanup
      await db.delete(pots).where(eq(pots.id, toPot.id));
      await db.delete(users).where(eq(users.id, user.id));
    });
  },
});

Deno.test({
  name: "TransferService - createTransfer - validates destination pot exists",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const transferRepo = new TransferRepository();
      const potRepo = new PotRepository();
      const service = new TransferService(transferRepo, potRepo);

      // Create test user
      const [user] = await db
        .insert(users)
        .values({
          email: "validuser2@example.com",
          passwordHash: "hash123",
          firstName: "Valid",
          lastName: "User",
        })
        .returning();

      // Create source pot only
      const [fromPot] = await db
        .insert(pots)
        .values({
          name: "Source Pot",
          type: "shared",
          ownerId: user.id,
        })
        .returning();

      // Try to create transfer with non-existent destination pot
      const transferData = {
        fromPotId: fromPot.id,
        toPotId: "00000000-0000-0000-0000-000000000000",
        amountCents: 1000 as Cents,
        occurredOn: new Date(),
      };

      await assertRejects(
        async () => await service.createTransfer(transferData),
        Error,
        "Destination pot not found"
      );

      // Cleanup
      await db.delete(pots).where(eq(pots.id, fromPot.id));
      await db.delete(users).where(eq(users.id, user.id));
    });
  },
});

Deno.test({
  name: "TransferService - createTransfer - validates cannot transfer to same pot",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const transferRepo = new TransferRepository();
      const potRepo = new PotRepository();
      const service = new TransferService(transferRepo, potRepo);

      // Create test user
      const [user] = await db
        .insert(users)
        .values({
          email: "samepotuser@example.com",
          passwordHash: "hash123",
          firstName: "SamePot",
          lastName: "User",
        })
        .returning();

      // Create a single pot
      const [pot] = await db
        .insert(pots)
        .values({
          name: "Same Pot",
          type: "shared",
          ownerId: user.id,
        })
        .returning();

      // Try to create transfer with same pot as source and destination
      const transferData = {
        fromPotId: pot.id,
        toPotId: pot.id,
        amountCents: 1000 as Cents,
        occurredOn: new Date(),
      };

      await assertRejects(
        async () => await service.createTransfer(transferData),
        Error,
        "Cannot transfer to the same pot"
      );

      // Cleanup
      await db.delete(pots).where(eq(pots.id, pot.id));
      await db.delete(users).where(eq(users.id, user.id));
    });
  },
});

Deno.test({
  name: "TransferService - createTransfer - validates schema (negative amount)",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const transferRepo = new TransferRepository();
      const potRepo = new PotRepository();
      const service = new TransferService(transferRepo, potRepo);

      // Try to create transfer with negative amount
      const transferData = {
        fromPotId: null,
        toPotId: "00000000-0000-0000-0000-000000000000",
        amountCents: -1000 as Cents,
        occurredOn: new Date(),
      };

      await assertRejects(
        async () => await service.createTransfer(transferData),
        Error
      );
    });
  },
});

Deno.test({
  name: "TransferService - createTransfer - validates at least one pot ID required",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const transferRepo = new TransferRepository();
      const potRepo = new PotRepository();
      const service = new TransferService(transferRepo, potRepo);

      // Try to create transfer with both pot IDs null
      const transferData = {
        fromPotId: null,
        toPotId: null,
        amountCents: 1000 as Cents,
        occurredOn: new Date(),
      };

      await assertRejects(
        async () => await service.createTransfer(transferData),
        Error,
        "At least one of fromPotId or toPotId must be specified"
      );
    });
  },
});
