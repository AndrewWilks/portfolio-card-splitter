import { assertEquals } from "@std/assert";
import { LedgerService } from "../../services/index.ts";
import {
  CardAccountRepository,
  TransactionRepository,
  PaymentRepository,
} from "../../repositories/index.ts";
import { withTestDB } from "../testHelpers.ts";
import { db } from "@db";
import {
  users,
  cardAccounts,
  merchants,
  transactions,
  pots,
  payments,
} from "../../db/db.schema.ts";
import type { Cents } from "@shared/types";

Deno.test({
  name: "LedgerService - calculates outstanding balance for single CardAccount",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const ledgerService = new LedgerService(
        new CardAccountRepository(),
        new TransactionRepository(),
        new PaymentRepository()
      );

      // Setup: Create user
      const [user] = await db
        .insert(users)
        .values({
          email: "test@example.com",
          passwordHash: "hash",
          firstName: "Test",
          lastName: "User",
        })
        .returning();

      // Create card account
      const [cardAccount] = await db
        .insert(cardAccounts)
        .values({
          name: "Test Card",
          issuer: "Test Bank",
          last4: "1234",
          billingCycle: 15,
          creditLimitCents: 500000, // $5,000 credit limit
          ownerId: user.id,
        })
        .returning();

      // Create merchant
      const [merchant] = await db
        .insert(merchants)
        .values({
          name: "Test Merchant",
        })
        .returning();

      // Create transactions totaling $150
      const [transaction1] = await db
        .insert(transactions)
        .values({
          cardAccountId: cardAccount.id,
          merchantId: merchant.id,
          description: "Purchase 1",
          amountCents: 10000, // $100.00
          type: "expense",
          transactionDate: new Date(),
          createdById: user.id,
        })
        .returning();

      await db
        .insert(transactions)
        .values({
          cardAccountId: cardAccount.id,
          merchantId: merchant.id,
          description: "Purchase 2",
          amountCents: 5000, // $50.00
          type: "expense",
          transactionDate: new Date(),
          createdById: user.id,
        })
        .returning();

      // Create pot
      const [pot] = await db
        .insert(pots)
        .values({
          name: "Test Pot",
          type: "solo",
          ownerId: user.id,
        })
        .returning();

      // Create payment for $60
      await db.insert(payments).values({
        potId: pot.id,
        transactionId: transaction1.id,
        amountCents: 6000, // $60.00 paid
        paidOn: new Date(),
        createdById: user.id,
      });

      // Test: Get balance for this card account
      const balance = await ledgerService.getCardAccountBalance(cardAccount.id);

      // Assert: Outstanding balance = $150 - $60 = $90
      assertEquals(balance.totalTransactions, 15000 as Cents);
      assertEquals(balance.totalPayments, 6000 as Cents);
      assertEquals(balance.outstandingBalance, 9000 as Cents);
      assertEquals(balance.transactionCount, 2);
      assertEquals(balance.paymentCount, 1);
      assertEquals(balance.cardAccount.id, cardAccount.id);
    });
  },
});

Deno.test({
  name: "LedgerService - getLedgerSummary provides totals across all CardAccounts",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const ledgerService = new LedgerService(
        new CardAccountRepository(),
        new TransactionRepository(),
        new PaymentRepository()
      );

      // Setup: Create user
      const [user] = await db
        .insert(users)
        .values({
          email: "summary@example.com",
          passwordHash: "hash",
          firstName: "Test",
          lastName: "User",
        })
        .returning();

      // Create two card accounts
      const [cardAccount1] = await db
        .insert(cardAccounts)
        .values({
          name: "Card 1",
          issuer: "Bank 1",
          last4: "1111",
          billingCycle: 15,
          creditLimitCents: 500000,
          ownerId: user.id,
        })
        .returning();

      const [cardAccount2] = await db
        .insert(cardAccounts)
        .values({
          name: "Card 2",
          issuer: "Bank 2",
          last4: "2222",
          billingCycle: 1,
          creditLimitCents: 300000,
          ownerId: user.id,
        })
        .returning();

      const [merchant] = await db
        .insert(merchants)
        .values({
          name: "Store",
        })
        .returning();

      const [pot] = await db
        .insert(pots)
        .values({
          name: "Payment Pot",
          type: "solo",
          ownerId: user.id,
        })
        .returning();

      // Card 1: $200 transactions, $100 paid = $100 outstanding
      const [tx1] = await db
        .insert(transactions)
        .values({
          cardAccountId: cardAccount1.id,
          merchantId: merchant.id,
          description: "Purchase A",
          amountCents: 20000,
          type: "expense",
          transactionDate: new Date(),
          createdById: user.id,
        })
        .returning();

      await db.insert(payments).values({
        potId: pot.id,
        transactionId: tx1.id,
        amountCents: 10000,
        paidOn: new Date(),
        createdById: user.id,
      });

      // Card 2: $150 transactions, $50 paid = $100 outstanding
      const [tx2] = await db
        .insert(transactions)
        .values({
          cardAccountId: cardAccount2.id,
          merchantId: merchant.id,
          description: "Purchase B",
          amountCents: 15000,
          type: "expense",
          transactionDate: new Date(),
          createdById: user.id,
        })
        .returning();

      await db.insert(payments).values({
        potId: pot.id,
        transactionId: tx2.id,
        amountCents: 5000,
        paidOn: new Date(),
        createdById: user.id,
      });

      // Test: Get ledger summary
      const summary = await ledgerService.getLedgerSummary(user.id);

      // Assert: Totals
      assertEquals(summary.cardAccounts.length, 2);
      assertEquals(summary.totalTransactions, 35000 as Cents);
      assertEquals(summary.totalPayments, 15000 as Cents);
      assertEquals(summary.totalOutstanding, 20000 as Cents);
    });
  },
});

Deno.test({
  name: "LedgerService - handles CardAccount with no transactions",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    await withTestDB(async () => {
      const ledgerService = new LedgerService(
        new CardAccountRepository(),
        new TransactionRepository(),
        new PaymentRepository()
      );

      const [user] = await db
        .insert(users)
        .values({
          email: "empty@example.com",
          passwordHash: "hash",
          firstName: "Test",
          lastName: "User",
        })
        .returning();

      const [cardAccount] = await db
        .insert(cardAccounts)
        .values({
          name: "Empty Card",
          issuer: "Bank",
          last4: "0000",
          billingCycle: 15,
          creditLimitCents: 200000,
          ownerId: user.id,
        })
        .returning();

      const balance = await ledgerService.getCardAccountBalance(cardAccount.id);

      assertEquals(balance.totalTransactions, 0 as Cents);
      assertEquals(balance.totalPayments, 0 as Cents);
      assertEquals(balance.outstandingBalance, 0 as Cents);
      assertEquals(balance.transactionCount, 0);
      assertEquals(balance.paymentCount, 0);
    });
  },
});
