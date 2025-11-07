import { assertEquals, assertRejects } from "@std/assert";
import { ReservationService } from "../../services/reservationService.ts";
import {
  ReservationRepository,
  PotRepository,
  TransactionRepository,
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
} from "../../db/db.schema.ts";
import type { Cents } from "@shared/types";

Deno.test({
  name: "ReservationService - createReservation - success",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const reservationRepo = new ReservationRepository();
      const potRepo = new PotRepository();
      const transactionRepo = new TransactionRepository();
      const memberRepo = new MemberRepository();

      const service = new ReservationService(
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
          type: "shared",
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
          merchantId: merchant.id,
          description: "Test Transaction",
          amountCents: 5000 as Cents,
          type: "expense",
          transactionDate: new Date(),
          createdById: user.id,
        })
        .returning();

      const [member] = await db
        .insert(members)
        .values({
          userId: user.id,
          displayName: "Test Member",
        })
        .returning();

      // Create reservation
      const reservationData = {
        potId: pot.id,
        transactionId: transaction.id,
        memberId: member.id,
        amountCents: 2500 as Cents,
        createdById: user.id,
      };

      const reservation = await service.createReservation(reservationData);

      assertEquals(reservation.potId, reservationData.potId);
      assertEquals(reservation.transactionId, reservationData.transactionId);
      assertEquals(reservation.memberId, reservationData.memberId);
      assertEquals(reservation.amountCents, reservationData.amountCents);
    });
  },
});

Deno.test({
  name: "ReservationService - createReservation - validates pot exists",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const reservationRepo = new ReservationRepository();
      const potRepo = new PotRepository();
      const transactionRepo = new TransactionRepository();
      const memberRepo = new MemberRepository();

      const service = new ReservationService(
        reservationRepo,
        potRepo,
        transactionRepo,
        memberRepo
      );

      const [user] = await db
        .insert(users)
        .values({
          email: "test2@example.com",
          passwordHash: "hash",
          firstName: "Test",
          lastName: "User",
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
          merchantId: merchant.id,
          description: "Test Transaction",
          amountCents: 5000 as Cents,
          type: "expense",
          transactionDate: new Date(),
          createdById: user.id,
        })
        .returning();

      const [member] = await db
        .insert(members)
        .values({
          userId: user.id,
          displayName: "Test Member",
        })
        .returning();

      await assertRejects(
        async () => {
          await service.createReservation({
            potId: crypto.randomUUID(), // Non-existent pot
            transactionId: transaction.id,
            memberId: member.id,
            amountCents: 2500 as Cents,
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
  name: "ReservationService - createReservation - validates transaction exists",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const reservationRepo = new ReservationRepository();
      const potRepo = new PotRepository();
      const transactionRepo = new TransactionRepository();
      const memberRepo = new MemberRepository();

      const service = new ReservationService(
        reservationRepo,
        potRepo,
        transactionRepo,
        memberRepo
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

      const [pot] = await db
        .insert(pots)
        .values({
          name: "Test Pot",
          type: "shared",
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

      await assertRejects(
        async () => {
          await service.createReservation({
            potId: pot.id,
            transactionId: crypto.randomUUID(), // Non-existent transaction
            memberId: member.id,
            amountCents: 2500 as Cents,
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
  name: "ReservationService - createReservation - validates member exists",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const reservationRepo = new ReservationRepository();
      const potRepo = new PotRepository();
      const transactionRepo = new TransactionRepository();
      const memberRepo = new MemberRepository();

      const service = new ReservationService(
        reservationRepo,
        potRepo,
        transactionRepo,
        memberRepo
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
          type: "shared",
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
          await service.createReservation({
            potId: pot.id,
            transactionId: transaction.id,
            memberId: crypto.randomUUID(), // Non-existent member
            amountCents: 2500 as Cents,
            createdById: user.id,
          });
        },
        Error,
        "Member not found"
      );
    });
  },
});

Deno.test({
  name: "ReservationService - deleteReservation - success",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const reservationRepo = new ReservationRepository();
      const potRepo = new PotRepository();
      const transactionRepo = new TransactionRepository();
      const memberRepo = new MemberRepository();

      const service = new ReservationService(
        reservationRepo,
        potRepo,
        transactionRepo,
        memberRepo
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
          type: "shared",
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
          merchantId: merchant.id,
          description: "Test Transaction",
          amountCents: 5000 as Cents,
          type: "expense",
          transactionDate: new Date(),
          createdById: user.id,
        })
        .returning();

      const [member] = await db
        .insert(members)
        .values({
          userId: user.id,
          displayName: "Test Member",
        })
        .returning();

      // Create reservation
      const reservation = await service.createReservation({
        potId: pot.id,
        transactionId: transaction.id,
        memberId: member.id,
        amountCents: 2500 as Cents,
        createdById: user.id,
      });

      // Delete reservation
      await service.deleteReservation(reservation.id);

      // Verify it's deleted
      const deleted = await service.findById(reservation.id);
      assertEquals(deleted, null);
    });
  },
});

Deno.test({
  name: "ReservationService - deleteReservation - validates reservation exists",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const reservationRepo = new ReservationRepository();
      const potRepo = new PotRepository();
      const transactionRepo = new TransactionRepository();
      const memberRepo = new MemberRepository();

      const service = new ReservationService(
        reservationRepo,
        potRepo,
        transactionRepo,
        memberRepo
      );

      await assertRejects(
        async () => {
          await service.deleteReservation(crypto.randomUUID()); // Non-existent reservation
        },
        Error,
        "Reservation not found"
      );
    });
  },
});
