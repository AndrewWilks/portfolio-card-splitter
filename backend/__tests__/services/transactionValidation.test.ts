import { assertEquals, assertRejects } from "@std/assert";
import { TransactionService } from "../../services/transactionService.ts";
import {
  TransactionRepository,
  MerchantRepository,
  TagRepository,
  CardAccountRepository,
  CardRepository,
  MemberRepository,
} from "../../repositories/index.ts";
import { withTestDB } from "../testHelpers.ts";
import { db } from "../../db/db.client.ts";
import {
  users,
  merchants,
  cardAccounts,
  members,
} from "../../db/db.schema.ts";
import type { Cents } from "@shared/types";

Deno.test({
  name: "TransactionService - createTransaction - validates member exists in allocations",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const transactionRepo = new TransactionRepository();
      const merchantRepo = new MerchantRepository();
      const tagRepo = new TagRepository();
      const cardAccountRepo = new CardAccountRepository();
      const cardRepo = new CardRepository();
      const memberRepo = new MemberRepository();

      const service = new TransactionService(
        transactionRepo,
        merchantRepo,
        tagRepo,
        cardAccountRepo,
        cardRepo,
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

      const [merchant] = await db
        .insert(merchants)
        .values({
          name: "Test Merchant",
        })
        .returning();

      const [pot] = await db
        .insert(users)
        .values({
          email: "pot@example.com",
          passwordHash: "hash",
          firstName: "Pot",
          lastName: "Owner",
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

      // Try to create transaction with non-existent member
      await assertRejects(
        async () => {
          await service.createTransaction({
            cardAccountId: cardAccount.id,
            merchantId: merchant.id,
            description: "Test Transaction",
            amountCents: 5000,
            type: "expense",
            transactionDate: new Date(),
            allocations: [
              {
                memberId: crypto.randomUUID(), // Non-existent member
                rule: "percentage",
                percentage: 10000, // 100%
              },
            ],
          });
        },
        Error,
        "Member with ID"
      );
    });
  },
});

Deno.test({
  name: "TransactionService - createTransaction - validates cardAccount exists",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const transactionRepo = new TransactionRepository();
      const merchantRepo = new MerchantRepository();
      const tagRepo = new TagRepository();
      const cardAccountRepo = new CardAccountRepository();
      const cardRepo = new CardRepository();
      const memberRepo = new MemberRepository();

      const service = new TransactionService(
        transactionRepo,
        merchantRepo,
        tagRepo,
        cardAccountRepo,
        cardRepo,
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

      const [merchant] = await db
        .insert(merchants)
        .values({
          name: "Test Merchant",
        })
        .returning();

      const [member] = await db
        .insert(members)
        .values({
          userId: user.id,
          displayName: "Test Member",
        })
        .returning();

      // Try to create transaction with non-existent cardAccount
      await assertRejects(
        async () => {
          await service.createTransaction({
            cardAccountId: crypto.randomUUID(), // Non-existent cardAccount
            merchantId: merchant.id,
            description: "Test Transaction",
            amountCents: 5000,
            type: "expense",
            transactionDate: new Date(),
            allocations: [
              {
                memberId: member.id,
                rule: "percentage",
                percentage: 10000,
              },
            ],
          });
        },
        Error,
        "CardAccount with ID"
      );
    });
  },
});

Deno.test({
  name: "TransactionService - createTransaction - validates allocations sum to 100%",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const transactionRepo = new TransactionRepository();
      const merchantRepo = new MerchantRepository();
      const tagRepo = new TagRepository();
      const cardAccountRepo = new CardAccountRepository();
      const cardRepo = new CardRepository();
      const memberRepo = new MemberRepository();

      const service = new TransactionService(
        transactionRepo,
        merchantRepo,
        tagRepo,
        cardAccountRepo,
        cardRepo,
        memberRepo
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

      const [merchant] = await db
        .insert(merchants)
        .values({
          name: "Test Merchant",
        })
        .returning();

      const [pot] = await db
        .insert(users)
        .values({
          email: "pot3@example.com",
          passwordHash: "hash",
          firstName: "Pot",
          lastName: "Owner",
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

      const [member] = await db
        .insert(members)
        .values({
          userId: user.id,
          displayName: "Test Member",
        })
        .returning();

      // Try to create transaction with allocations that don't sum to 100%
      await assertRejects(
        async () => {
          await service.createTransaction({
            cardAccountId: cardAccount.id,
            merchantId: merchant.id,
            description: "Test Transaction",
            amountCents: 5000,
            type: "expense",
            transactionDate: new Date(),
            allocations: [
              {
                memberId: member.id,
                rule: "percentage",
                percentage: 5000, // Only 50%
              },
            ],
          });
        },
        Error,
        "must sum to 100%"
      );
    });
  },
});

Deno.test({
  name: "TransactionService - createTransaction - validates fixed allocations don't exceed total",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const transactionRepo = new TransactionRepository();
      const merchantRepo = new MerchantRepository();
      const tagRepo = new TagRepository();
      const cardAccountRepo = new CardAccountRepository();
      const cardRepo = new CardRepository();
      const memberRepo = new MemberRepository();

      const service = new TransactionService(
        transactionRepo,
        merchantRepo,
        tagRepo,
        cardAccountRepo,
        cardRepo,
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

      const [merchant] = await db
        .insert(merchants)
        .values({
          name: "Test Merchant",
        })
        .returning();

      const [pot] = await db
        .insert(users)
        .values({
          email: "pot4@example.com",
          passwordHash: "hash",
          firstName: "Pot",
          lastName: "Owner",
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

      const [member] = await db
        .insert(members)
        .values({
          userId: user.id,
          displayName: "Test Member",
        })
        .returning();

      // Try to create transaction with fixed allocations exceeding total
      await assertRejects(
        async () => {
          await service.createTransaction({
            cardAccountId: cardAccount.id,
            merchantId: merchant.id,
            description: "Test Transaction",
            amountCents: 5000,
            type: "expense",
            transactionDate: new Date(),
            allocations: [
              {
                memberId: member.id,
                rule: "fixed_amount",
                amountCents: 6000, // Exceeds transaction amount
              },
            ],
          });
        },
        Error,
        "exceed transaction amount"
      );
    });
  },
});

Deno.test({
  name: "TransactionService - createTransaction - validates cannot mix allocation types",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const transactionRepo = new TransactionRepository();
      const merchantRepo = new MerchantRepository();
      const tagRepo = new TagRepository();
      const cardAccountRepo = new CardAccountRepository();
      const cardRepo = new CardRepository();
      const memberRepo = new MemberRepository();

      const service = new TransactionService(
        transactionRepo,
        merchantRepo,
        tagRepo,
        cardAccountRepo,
        cardRepo,
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

      const [merchant] = await db
        .insert(merchants)
        .values({
          name: "Test Merchant",
        })
        .returning();

      const [pot] = await db
        .insert(users)
        .values({
          email: "pot5@example.com",
          passwordHash: "hash",
          firstName: "Pot",
          lastName: "Owner",
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

      // Try to create transaction mixing percentage and fixed allocations
      await assertRejects(
        async () => {
          await service.createTransaction({
            cardAccountId: cardAccount.id,
            merchantId: merchant.id,
            description: "Test Transaction",
            amountCents: 5000,
            type: "expense",
            transactionDate: new Date(),
            allocations: [
              {
                memberId: member1.id,
                rule: "percentage",
                percentage: 5000, // 50%
              },
              {
                memberId: member2.id,
                rule: "fixed_amount",
                amountCents: 2500,
              },
            ],
          });
        },
        Error,
        "Cannot mix percentage and fixed amount"
      );
    });
  },
});

Deno.test({
  name: "TransactionService - createTransaction - success with valid data",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const transactionRepo = new TransactionRepository();
      const merchantRepo = new MerchantRepository();
      const tagRepo = new TagRepository();
      const cardAccountRepo = new CardAccountRepository();
      const cardRepo = new CardRepository();
      const memberRepo = new MemberRepository();

      const service = new TransactionService(
        transactionRepo,
        merchantRepo,
        tagRepo,
        cardAccountRepo,
        cardRepo,
        memberRepo
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

      const [merchant] = await db
        .insert(merchants)
        .values({
          name: "Test Merchant",
        })
        .returning();

      const [pot] = await db
        .insert(users)
        .values({
          email: "pot6@example.com",
          passwordHash: "hash",
          firstName: "Pot",
          lastName: "Owner",
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

      const [member] = await db
        .insert(members)
        .values({
          userId: user.id,
          displayName: "Test Member",
        })
        .returning();

      // Create transaction with valid data
      const transaction = await service.createTransaction({
        cardAccountId: cardAccount.id,
        merchantId: merchant.id,
        description: "Test Transaction",
        amountCents: 5000,
        type: "expense",
        transactionDate: new Date(),
        allocations: [
          {
            memberId: member.id,
            rule: "percentage",
            percentage: 10000, // 100%
          },
        ],
      });

      assertEquals(transaction.cardAccountId, cardAccount.id);
      assertEquals(transaction.merchantId, merchant.id);
      assertEquals(transaction.amountCents, 5000 as Cents);
      assertEquals(transaction.description, "Test Transaction");
    });
  },
});
