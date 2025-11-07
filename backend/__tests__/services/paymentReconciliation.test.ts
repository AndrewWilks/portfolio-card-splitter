import { assertEquals, assertRejects } from "@std/assert";
import { PaymentService } from "../../services/paymentService.ts";
import { ReservationService } from "../../services/reservationService.ts";
import {
  PaymentRepository,
  TransactionRepository,
  PotRepository,
  ReservationRepository,
  MemberRepository,
} from "../../repositories/index.ts";
import { withTestDB } from "../testHelpers.ts";
import { db } from "../../db/db.client.ts";
import {
  pots,
  users,
  merchants,
  transactions,
  members,
  cardAccounts,
} from "../../db/db.schema.ts";
import type { Cents } from "@shared/types";

Deno.test({
  name: "PaymentService - createPayment - flags reconciliation when payment differs from reservations",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const paymentRepo = new PaymentRepository();
      const transactionRepo = new TransactionRepository();
      const potRepo = new PotRepository();
      const reservationRepo = new ReservationRepository();
      const memberRepo = new MemberRepository();

      const paymentService = new PaymentService(
        paymentRepo,
        transactionRepo,
        potRepo,
        reservationRepo
      );

      const reservationService = new ReservationService(
        reservationRepo,
        potRepo,
        transactionRepo,
        memberRepo
      );

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

      const [member] = await db
        .insert(members)
        .values({
          potId: pot.id,
          userId: user.id,
          displayName: "Test Member",
        })
        .returning();

      const [merchant] = await db
        .insert(merchants)
        .values({
          name: "Test Merchant",
        })
        .returning();

      const [cardAccount] = await db
        .insert(cardAccounts)
        .values({
          potId: pot.id,
          accountNumber: "1234",
          balance: 0 as Cents,
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

      // Create reservations totaling 5000 (matching transaction)
      await reservationService.createReservation({
        potId: pot.id,
        transactionId: transaction.id,
        memberId: member.id,
        amountCents: 3000 as Cents,
        createdById: user.id,
      });

      await reservationService.createReservation({
        potId: pot.id,
        transactionId: transaction.id,
        memberId: member.id,
        amountCents: 2000 as Cents,
        createdById: user.id,
      });

      // Make a payment that differs from reservations
      const payment = await paymentService.createPayment({
        potId: pot.id,
        transactionId: transaction.id,
        amountCents: 4000 as Cents, // Different from reservation total
        paidOn: new Date(),
        createdById: user.id,
      });

      // Should be flagged for reconciliation
      assertEquals(payment.needsReconciliation, true);
    });
  },
});

Deno.test({
  name: "PaymentService - createPayment - no reconciliation flag when payment matches reservations",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const paymentRepo = new PaymentRepository();
      const transactionRepo = new TransactionRepository();
      const potRepo = new PotRepository();
      const reservationRepo = new ReservationRepository();
      const memberRepo = new MemberRepository();

      const paymentService = new PaymentService(
        paymentRepo,
        transactionRepo,
        potRepo,
        reservationRepo
      );

      const reservationService = new ReservationService(
        reservationRepo,
        potRepo,
        transactionRepo,
        memberRepo
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

      const [member] = await db
        .insert(members)
        .values({
          potId: pot.id,
          userId: user.id,
          displayName: "Test Member",
        })
        .returning();

      const [merchant] = await db
        .insert(merchants)
        .values({
          name: "Test Merchant",
        })
        .returning();

      const [cardAccount] = await db
        .insert(cardAccounts)
        .values({
          potId: pot.id,
          accountNumber: "1234",
          balance: 0 as Cents,
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

      // Create reservation totaling 5000 (matching transaction)
      await reservationService.createReservation({
        potId: pot.id,
        transactionId: transaction.id,
        memberId: member.id,
        amountCents: 5000 as Cents,
        createdById: user.id,
      });

      // Make a payment that exactly matches reservation total
      const payment = await paymentService.createPayment({
        potId: pot.id,
        transactionId: transaction.id,
        amountCents: 5000 as Cents, // Matches reservation total
        paidOn: new Date(),
        createdById: user.id,
      });

      // Should NOT be flagged for reconciliation
      assertEquals(payment.needsReconciliation, false);
    });
  },
});

Deno.test({
  name: "PaymentService - createPayment - no reconciliation flag when no reservations exist",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const paymentRepo = new PaymentRepository();
      const transactionRepo = new TransactionRepository();
      const potRepo = new PotRepository();
      const reservationRepo = new ReservationRepository();

      const paymentService = new PaymentService(
        paymentRepo,
        transactionRepo,
        potRepo,
        reservationRepo
      );

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

      const [merchant] = await db
        .insert(merchants)
        .values({
          name: "Test Merchant",
        })
        .returning();

      const [cardAccount] = await db
        .insert(cardAccounts)
        .values({
          potId: pot.id,
          accountNumber: "1234",
          balance: 0 as Cents,
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

      // No reservations created

      // Make a payment
      const payment = await paymentService.createPayment({
        potId: pot.id,
        transactionId: transaction.id,
        amountCents: 3000 as Cents,
        paidOn: new Date(),
        createdById: user.id,
      });

      // Should NOT be flagged for reconciliation (no reservations to compare against)
      assertEquals(payment.needsReconciliation, false);
    });
  },
});

Deno.test({
  name: "PaymentService - createPayment - flags reconciliation with multiple partial payments",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const paymentRepo = new PaymentRepository();
      const transactionRepo = new TransactionRepository();
      const potRepo = new PotRepository();
      const reservationRepo = new ReservationRepository();
      const memberRepo = new MemberRepository();

      const paymentService = new PaymentService(
        paymentRepo,
        transactionRepo,
        potRepo,
        reservationRepo
      );

      const reservationService = new ReservationService(
        reservationRepo,
        potRepo,
        transactionRepo,
        memberRepo
      );

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

      const [pot] = await db
        .insert(pots)
        .values({
          name: "Test Pot",
          type: "solo",
          ownerId: user.id,
        })
        .returning();

      const [member] = await db
        .insert(members)
        .values({
          potId: pot.id,
          userId: user.id,
          displayName: "Test Member",
        })
        .returning();

      const [merchant] = await db
        .insert(merchants)
        .values({
          name: "Test Merchant",
        })
        .returning();

      const [cardAccount] = await db
        .insert(cardAccounts)
        .values({
          potId: pot.id,
          accountNumber: "1234",
          balance: 0 as Cents,
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

      // Create reservations totaling 5000
      await reservationService.createReservation({
        potId: pot.id,
        transactionId: transaction.id,
        memberId: member.id,
        amountCents: 5000 as Cents,
        createdById: user.id,
      });

      // Make first payment - partial, should be flagged
      const payment1 = await paymentService.createPayment({
        potId: pot.id,
        transactionId: transaction.id,
        amountCents: 2000 as Cents,
        paidOn: new Date(),
        createdById: user.id,
      });

      assertEquals(
        payment1.needsReconciliation,
        true,
        "First partial payment should be flagged"
      );

      // Make second payment - completes the total, should not be flagged
      const payment2 = await paymentService.createPayment({
        potId: pot.id,
        transactionId: transaction.id,
        amountCents: 3000 as Cents,
        paidOn: new Date(),
        createdById: user.id,
      });

      assertEquals(
        payment2.needsReconciliation,
        false,
        "Completing payment should not be flagged"
      );
    });
  },
});
