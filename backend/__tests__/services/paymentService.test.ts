import { assertEquals, assertRejects } from "@std/assert";
import { PaymentService } from "../../services/paymentService.ts";
import {
  PaymentRepository,
  TransactionRepository,
  PotRepository,
  ReservationRepository,
} from "../../repositories/index.ts";
import { withTestDB } from "../testHelpers.ts";
import { db } from "../../db/db.client.ts";
import {
  pots,
  users,
  merchants,
  transactions,
  cardAccounts,
} from "../../db/db.schema.ts";
import type { Cents } from "@shared/types";

Deno.test({
  name: "PaymentService - createPayment - success",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const paymentRepo = new PaymentRepository();
      const transactionRepo = new TransactionRepository();
      const potRepo = new PotRepository();
      const reservationRepo = new ReservationRepository();

      const service = new PaymentService(
        paymentRepo,
        transactionRepo,
        potRepo,
        reservationRepo
      );

      // Create test data using direct database inserts
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
          description: "Test Transaction",
          amountCents: 5000 as Cents,
          type: "expense",
          transactionDate: new Date(),
          createdById: user.id,
        })
        .returning();

      // Create payment
      const paymentData = {
        potId: pot.id,
        transactionId: transaction.id,
        amountCents: 3000 as Cents,
        paidOn: new Date(),
        note: "Test payment",
        createdById: user.id,
      };

      const payment = await service.createPayment(paymentData);

      assertEquals(payment.potId, paymentData.potId);
      assertEquals(payment.transactionId, paymentData.transactionId);
      assertEquals(payment.amountCents, paymentData.amountCents);
      assertEquals(payment.note, paymentData.note);
    });
  },
});

Deno.test({
  name: "PaymentService - createPayment - validates payment doesn't exceed transaction total",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const paymentRepo = new PaymentRepository();
      const transactionRepo = new TransactionRepository();
      const potRepo = new PotRepository();
      const reservationRepo = new ReservationRepository();

      const service = new PaymentService(
        paymentRepo,
        transactionRepo,
        potRepo,
        reservationRepo
      );

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
          description: "Test Transaction",
          amountCents: 5000 as Cents,
          type: "expense",
          transactionDate: new Date(),
          createdById: user.id,
        })
        .returning();

      // Create first payment
      await service.createPayment({
        potId: pot.id,
        transactionId: transaction.id,
        amountCents: 3000 as Cents,
        paidOn: new Date(),
        createdById: user.id,
      });

      // Try to create second payment that exceeds total
      await assertRejects(
        async () => {
          await service.createPayment({
            potId: pot.id,
            transactionId: transaction.id,
            amountCents: 3000 as Cents, // Total would be 6000, exceeds 5000
            paidOn: new Date(),
            createdById: user.id,
          });
        },
        Error,
        "Payment would exceed transaction total"
      );
    });
  },
});

Deno.test({
  name: "PaymentService - createPayment - validates pot exists",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const paymentRepo = new PaymentRepository();
      const transactionRepo = new TransactionRepository();
      const potRepo = new PotRepository();
      const reservationRepo = new ReservationRepository();

      const service = new PaymentService(
        paymentRepo,
        transactionRepo,
        potRepo,
        reservationRepo
      );

      const [user] = await db
        .insert(users)
        .values({
          email: "test3@example.com",
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
          description: "Test Transaction",
          amountCents: 5000 as Cents,
          type: "expense",
          transactionDate: new Date(),
          createdById: user.id,
        })
        .returning();

      await assertRejects(
        async () => {
          await service.createPayment({
            potId: crypto.randomUUID(), // Non-existent pot
            transactionId: transaction.id,
            amountCents: 3000 as Cents,
            paidOn: new Date(),
            createdById: user.id,
          });
        },
        Error,
        "Pot not found"
      );
    });
  },
});

Deno.test({
  name: "PaymentService - createPayment - validates transaction exists",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const paymentRepo = new PaymentRepository();
      const transactionRepo = new TransactionRepository();
      const potRepo = new PotRepository();
      const reservationRepo = new ReservationRepository();

      const service = new PaymentService(
        paymentRepo,
        transactionRepo,
        potRepo,
        reservationRepo
      );

      const [user] = await db
        .insert(users)
        .values({
          email: "test4@example.com",
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

      await assertRejects(
        async () => {
          await service.createPayment({
            potId: pot.id,
            transactionId: crypto.randomUUID(), // Non-existent transaction
            amountCents: 3000 as Cents,
            paidOn: new Date(),
            createdById: user.id,
          });
        },
        Error,
        "Transaction not found"
      );
    });
  },
});

Deno.test({
  name: "PaymentService - createPayment - validates schema",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const paymentRepo = new PaymentRepository();
      const transactionRepo = new TransactionRepository();
      const potRepo = new PotRepository();
      const reservationRepo = new ReservationRepository();

      const service = new PaymentService(
        paymentRepo,
        transactionRepo,
        potRepo,
        reservationRepo
      );

      // Test invalid data (negative amount)
      await assertRejects(async () => {
        await service.createPayment({
          potId: crypto.randomUUID(),
          transactionId: crypto.randomUUID(),
          amountCents: -100 as Cents, // Invalid: negative amount
          paidOn: new Date(),
        });
      }, Error);
    });
  },
});
