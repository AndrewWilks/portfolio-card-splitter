import { assertEquals, assertRejects } from "@std/assert";
import { db } from "../../db/db.client.ts";
import {
  payments,
  users,
  pots,
  merchants,
  transactions,
  cardAccounts,
} from "../../db/db.schema.ts";
import { withTestDB } from "../testHelpers.ts";
import type { Cents } from "@shared/types";

Deno.test({
  name: "PaymentRepository - insert payment with required potId",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      // Create test data
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

      const [cardAccount] = await db
        .insert(cardAccounts)
        .values({
          name: "Test Card Account",
          issuer: "Test Bank",
          last4: "1234",
          billingCycle: 1,
          ownerId: user.id,
        })
        .returning();

      const [merchant] = await db
        .insert(merchants)
        .values({
          name: "Test Merchant",
        })
        .returning();

      const [transaction] = await db
        .insert(transactions)
        .values({
          cardAccountId: cardAccount.id,
          merchantId: merchant.id,
          description: "Test transaction",
          amountCents: 10000 as Cents,
          transactionDate: new Date(),
          createdById: user.id,
        })
        .returning();

      // Insert payment with required potId
      const [payment] = await db
        .insert(payments)
        .values({
          potId: pot.id,
          transactionId: transaction.id,
          amountCents: 10000 as Cents,
          paidOn: new Date(),
          note: "Test payment",
          createdById: user.id,
        })
        .returning();

      assertEquals(payment.potId, pot.id);
      assertEquals(payment.transactionId, transaction.id);
      assertEquals(payment.amountCents, 10000);
      assertEquals(payment.note, "Test payment");
    });
  },
});

Deno.test({
  name: "PaymentRepository - payment with paidOn date",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      // Create test data
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

      const [cardAccount] = await db
        .insert(cardAccounts)
        .values({
          name: "Test Card Account",
          issuer: "Test Bank",
          last4: "1234",
          billingCycle: 1,
          ownerId: user.id,
        })
        .returning();

      const [merchant] = await db
        .insert(merchants)
        .values({
          name: "Test Merchant",
        })
        .returning();

      const [transaction] = await db
        .insert(transactions)
        .values({
          cardAccountId: cardAccount.id,
          merchantId: merchant.id,
          description: "Test transaction",
          amountCents: 5000 as Cents,
          transactionDate: new Date(),
          createdById: user.id,
        })
        .returning();

      const paidDate = new Date("2025-01-15");

      // Insert payment with specific paidOn date
      const [payment] = await db
        .insert(payments)
        .values({
          potId: pot.id,
          transactionId: transaction.id,
          amountCents: 5000 as Cents,
          paidOn: paidDate,
          createdById: user.id,
        })
        .returning();

      assertEquals(payment.paidOn, paidDate);
      assertEquals(payment.potId, pot.id);
    });
  },
});

Deno.test({
  name: "PaymentRepository - payment uses default paidOn date",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      // Create test data
      const [user] = await db
        .insert(users)
        .values({
          email: "test3@example.com",
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

      const [cardAccount] = await db
        .insert(cardAccounts)
        .values({
          name: "Test Card Account",
          issuer: "Test Bank",
          last4: "1234",
          billingCycle: 1,
          ownerId: user.id,
        })
        .returning();

      const [merchant] = await db
        .insert(merchants)
        .values({
          name: "Test Merchant",
        })
        .returning();

      const [transaction] = await db
        .insert(transactions)
        .values({
          cardAccountId: cardAccount.id,
          merchantId: merchant.id,
          description: "Test transaction",
          amountCents: 3000 as Cents,
          transactionDate: new Date(),
          createdById: user.id,
        })
        .returning();

      // Insert payment without paidOn (should use default CURRENT_DATE)
      const [payment] = await db
        .insert(payments)
        .values({
          potId: pot.id,
          transactionId: transaction.id,
          amountCents: 3000 as Cents,
          createdById: user.id,
        })
        .returning();

      // Verify paidOn was set (should be a valid date close to today)
      const paymentDate = new Date(payment.paidOn);
      const now = new Date();

      // Check that the payment date is within 2 days of now (handles timezone differences)
      const diffMs = Math.abs(now.getTime() - paymentDate.getTime());
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      assertEquals(
        diffDays < 2,
        true,
        `Payment date should be within 2 days of today, but got ${diffDays} days difference`
      );
    });
  },
});

Deno.test({
  name: "PaymentRepository - reject payment without potId (constraint violation)",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      // Create test data
      const [user] = await db
        .insert(users)
        .values({
          email: "test4@example.com",
          passwordHash: "hash",
          firstName: "Test",
          lastName: "User",
        })
        .returning();

      const [cardAccount] = await db
        .insert(cardAccounts)
        .values({
          name: "Test Card Account",
          issuer: "Test Bank",
          last4: "1234",
          billingCycle: 1,
          ownerId: user.id,
        })
        .returning();

      const [merchant] = await db
        .insert(merchants)
        .values({
          name: "Test Merchant",
        })
        .returning();

      const [transaction] = await db
        .insert(transactions)
        .values({
          cardAccountId: cardAccount.id,
          merchantId: merchant.id,
          description: "Test transaction",
          amountCents: 1000 as Cents,
          transactionDate: new Date(),
          createdById: user.id,
        })
        .returning();

      // Attempt to insert payment without potId - should fail
      await assertRejects(
        async () => {
          await db
            .insert(payments)
            .values({
              // @ts-expect-error: Testing NULL constraint violation
              potId: null,
              transactionId: transaction.id,
              amountCents: 1000 as Cents,
              createdById: user.id,
            })
            .returning();
        },
        Error
        // PostgreSQL will report a NOT NULL constraint violation
      );
    });
  },
});
