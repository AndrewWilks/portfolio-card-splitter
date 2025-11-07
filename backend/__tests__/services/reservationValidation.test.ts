import { assertEquals, assertRejects } from "@std/assert";
import { ReservationService } from "../../services/reservationService.ts";
import {
  ReservationRepository,
  PotRepository,
  TransactionRepository,
  MemberRepository,
  AllocationRepository,
} from "../../repositories/index.ts";
import { withTestDB } from "../testHelpers.ts";
import { db } from "../../db/db.client.ts";
import {
  pots,
  users,
  merchants,
  transactions,
  members,
  allocations,
  cardAccounts,
} from "../../db/db.schema.ts";
import type { Cents } from "@shared/types";

Deno.test({
  name: "ReservationService - createReservation - validates allocation exists",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const reservationRepo = new ReservationRepository();
      const potRepo = new PotRepository();
      const transactionRepo = new TransactionRepository();
      const memberRepo = new MemberRepository();
      const allocationRepo = new AllocationRepository();

      const service = new ReservationService(
        reservationRepo,
        potRepo,
        transactionRepo,
        memberRepo,
        allocationRepo
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
          balance: 10000 as Cents,
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

      // Try to create reservation with non-existent allocation
      await assertRejects(
        async () => {
          await service.createReservation({
            potId: pot.id,
            transactionId: transaction.id,
            memberId: member.id,
            amountCents: 3000 as Cents,
            allocationId: crypto.randomUUID(), // Non-existent allocation
            createdById: user.id,
          });
        },
        Error,
        "Allocation not found"
      );
    });
  },
});

Deno.test({
  name: "ReservationService - createReservation - validates allocation belongs to transaction",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const reservationRepo = new ReservationRepository();
      const potRepo = new PotRepository();
      const transactionRepo = new TransactionRepository();
      const memberRepo = new MemberRepository();
      const allocationRepo = new AllocationRepository();

      const service = new ReservationService(
        reservationRepo,
        potRepo,
        transactionRepo,
        memberRepo,
        allocationRepo
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
          balance: 10000 as Cents,
        })
        .returning();

      const [transaction1] = await db
        .insert(transactions)
        .values({
          cardAccountId: cardAccount.id,
          merchantId: merchant.id,
          description: "Transaction 1",
          amountCents: 5000 as Cents,
          type: "expense",
          transactionDate: new Date(),
          createdById: user.id,
        })
        .returning();

      const [transaction2] = await db
        .insert(transactions)
        .values({
          cardAccountId: cardAccount.id,
          merchantId: merchant.id,
          description: "Transaction 2",
          amountCents: 3000 as Cents,
          type: "expense",
          transactionDate: new Date(),
          createdById: user.id,
        })
        .returning();

      // Create allocation for transaction1
      const [allocation] = await db
        .insert(allocations)
        .values({
          transactionId: transaction1.id,
          memberId: member.id,
          amountCents: 5000 as Cents,
          createdById: user.id,
        })
        .returning();

      // Try to create reservation for transaction2 with transaction1's allocation
      await assertRejects(
        async () => {
          await service.createReservation({
            potId: pot.id,
            transactionId: transaction2.id,
            memberId: member.id,
            amountCents: 3000 as Cents,
            allocationId: allocation.id,
            createdById: user.id,
          });
        },
        Error,
        "does not belong to transaction"
      );
    });
  },
});

Deno.test({
  name: "ReservationService - createReservation - validates allocation belongs to member",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const reservationRepo = new ReservationRepository();
      const potRepo = new PotRepository();
      const transactionRepo = new TransactionRepository();
      const memberRepo = new MemberRepository();
      const allocationRepo = new AllocationRepository();

      const service = new ReservationService(
        reservationRepo,
        potRepo,
        transactionRepo,
        memberRepo,
        allocationRepo
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

      const [member1] = await db
        .insert(members)
        .values({
          userId: user.id,
          displayName: "Member 1",
        })
        .returning();

      const [member2] = await db
        .insert(members)
        .values({
          userId: user.id,
          displayName: "Member 2",
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
          balance: 10000 as Cents,
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

      // Create allocation for member1
      const [allocation] = await db
        .insert(allocations)
        .values({
          transactionId: transaction.id,
          memberId: member1.id,
          amountCents: 5000 as Cents,
          createdById: user.id,
        })
        .returning();

      // Try to create reservation for member2 with member1's allocation
      await assertRejects(
        async () => {
          await service.createReservation({
            potId: pot.id,
            transactionId: transaction.id,
            memberId: member2.id,
            amountCents: 3000 as Cents,
            allocationId: allocation.id,
            createdById: user.id,
          });
        },
        Error,
        "does not belong to member"
      );
    });
  },
});

Deno.test({
  name: "ReservationService - createReservation - validates reservation doesn't exceed allocation amount",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const reservationRepo = new ReservationRepository();
      const potRepo = new PotRepository();
      const transactionRepo = new TransactionRepository();
      const memberRepo = new MemberRepository();
      const allocationRepo = new AllocationRepository();

      const service = new ReservationService(
        reservationRepo,
        potRepo,
        transactionRepo,
        memberRepo,
        allocationRepo
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
          balance: 10000 as Cents,
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

      // Create allocation for 3000 cents
      const [allocation] = await db
        .insert(allocations)
        .values({
          transactionId: transaction.id,
          memberId: member.id,
          amountCents: 3000 as Cents,
          createdById: user.id,
        })
        .returning();

      // Try to reserve 4000 cents (more than allocation)
      await assertRejects(
        async () => {
          await service.createReservation({
            potId: pot.id,
            transactionId: transaction.id,
            memberId: member.id,
            amountCents: 4000 as Cents,
            allocationId: allocation.id,
            createdById: user.id,
          });
        },
        Error,
        "exceeds allocation amount"
      );
    });
  },
});

Deno.test({
  name: "ReservationService - createReservation - validates total reservations don't exceed transaction amount",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const reservationRepo = new ReservationRepository();
      const potRepo = new PotRepository();
      const transactionRepo = new TransactionRepository();
      const memberRepo = new MemberRepository();
      const allocationRepo = new AllocationRepository();

      const service = new ReservationService(
        reservationRepo,
        potRepo,
        transactionRepo,
        memberRepo,
        allocationRepo
      );

      // Create test data
      const [user] = await db
        .insert(users)
        .values({
          email: "test5@example.com",
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
          balance: 10000 as Cents,
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

      // Create first reservation for 3000 cents
      await service.createReservation({
        potId: pot.id,
        transactionId: transaction.id,
        memberId: member.id,
        amountCents: 3000 as Cents,
        createdById: user.id,
      });

      // Try to create second reservation for 3000 cents (total would be 6000 > 5000)
      await assertRejects(
        async () => {
          await service.createReservation({
            potId: pot.id,
            transactionId: transaction.id,
            memberId: member.id,
            amountCents: 3000 as Cents,
            createdById: user.id,
          });
        },
        Error,
        "would exceed transaction amount"
      );
    });
  },
});

Deno.test({
  name: "ReservationService - createReservation - validates pot has sufficient balance",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const reservationRepo = new ReservationRepository();
      const potRepo = new PotRepository();
      const transactionRepo = new TransactionRepository();
      const memberRepo = new MemberRepository();
      const allocationRepo = new AllocationRepository();

      const service = new ReservationService(
        reservationRepo,
        potRepo,
        transactionRepo,
        memberRepo,
        allocationRepo
      );

      // Create test data
      const [user] = await db
        .insert(users)
        .values({
          email: "test6@example.com",
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
          balance: 2000 as Cents, // Only 2000 cents available
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

      // Try to reserve 3000 cents (more than pot balance of 2000)
      await assertRejects(
        async () => {
          await service.createReservation({
            potId: pot.id,
            transactionId: transaction.id,
            memberId: member.id,
            amountCents: 3000 as Cents,
            createdById: user.id,
          });
        },
        Error,
        "Insufficient pot balance"
      );
    });
  },
});

Deno.test({
  name: "ReservationService - createReservation - success with all validations passing",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const reservationRepo = new ReservationRepository();
      const potRepo = new PotRepository();
      const transactionRepo = new TransactionRepository();
      const memberRepo = new MemberRepository();
      const allocationRepo = new AllocationRepository();

      const service = new ReservationService(
        reservationRepo,
        potRepo,
        transactionRepo,
        memberRepo,
        allocationRepo
      );

      // Create test data
      const [user] = await db
        .insert(users)
        .values({
          email: "test7@example.com",
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
          balance: 10000 as Cents,
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

      // Create allocation
      const [allocation] = await db
        .insert(allocations)
        .values({
          transactionId: transaction.id,
          memberId: member.id,
          amountCents: 3000 as Cents,
          createdById: user.id,
        })
        .returning();

      // Create reservation - should succeed
      const reservation = await service.createReservation({
        potId: pot.id,
        transactionId: transaction.id,
        memberId: member.id,
        amountCents: 3000 as Cents,
        allocationId: allocation.id,
        createdById: user.id,
      });

      assertEquals(reservation.potId, pot.id);
      assertEquals(reservation.transactionId, transaction.id);
      assertEquals(reservation.memberId, member.id);
      assertEquals(reservation.amountCents, 3000 as Cents);
      assertEquals(reservation.allocationId, allocation.id);
    });
  },
});
