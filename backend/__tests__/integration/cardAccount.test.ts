import { assert, assertEquals, assertExists } from "@std/assert";
import {
  CardAccountService,
} from "../../services/index.ts";
import {
  CardAccountRepository,
  CardAccountSettingsRepository,
  TransactionRepository,
} from "../../repositories/index.ts";
import {
  createTestUser,
  createTestMerchant,
  withCleanDatabase,
} from "./testHelpers.ts";
import { db, Schemas } from "../../db/index.ts";


Deno.test(
  {
    name: "CardAccount Integration - Create CardAccount with Settings",
    sanitizeResources: false,
    sanitizeOps: false,
  },
  async () => {
    await withCleanDatabase(async () => {
      const user = await createTestUser();
      const service = new CardAccountService(
        new CardAccountRepository(),
        new CardAccountSettingsRepository(),
        new TransactionRepository()
      );

      const data = {
        name: "Test Card Account",
        issuer: "Test Bank",
        last4: "1234",
        billingCycle: 15,
        creditLimitCents: 500000,
      };

      const result = await service.createCardAccount(data, user.id);

      // Verify CardAccount created
      assertExists(result.cardAccount);
      assertEquals(result.cardAccount.name, data.name);
      assertEquals(result.cardAccount.issuer, data.issuer);
      assertEquals(result.cardAccount.last4, data.last4);
      assertEquals(result.cardAccount.ownerId, user.id);
      assert(result.cardAccount.isActive);

      // Verify Settings created with defaults
      assertExists(result.settings);
      assertEquals(result.settings.cardAccountId, result.cardAccount.id);
      assertEquals(result.settings.statementCloseDayOfMonth, 15);
      assertEquals(result.settings.statementFrequencyDays, 30);
      assertEquals(result.settings.paymentDueDaysAfterClose, 21);
      assertEquals(result.settings.interestFreeDays, 55);
      assert(result.settings.hasInterestFreePeriod);
      assertEquals(result.settings.minimumPaymentPercentage, 2);
      assertEquals(result.settings.minimumPaymentFloorCents, 2500);
    });
  }
);

Deno.test({
  name: "CardAccount Integration - List by Owner",
  sanitizeResources: false,
  sanitizeOps: false,
}, async () => {
  await withCleanDatabase(async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();

    const service = new CardAccountService(
      new CardAccountRepository(),
      new CardAccountSettingsRepository(),
      new TransactionRepository()
    );

    const data1 = {
      name: "Account 1",
      issuer: "Bank 1",
      last4: "1111",
      billingCycle: 15,
      creditLimitCents: 500000,
    };

    const data2 = {
      name: "Account 2",
      issuer: "Bank 2",
      last4: "2222",
      billingCycle: 20,
      creditLimitCents: 300000,
    };

    // Create accounts for both users
    await service.createCardAccount(data1, user1.id);
    await service.createCardAccount(data2, user1.id);
    await service.createCardAccount(data1, user2.id);

    // List user1's accounts
    const user1Accounts = await service.listCardAccounts(user1.id);
    assertEquals(user1Accounts.length, 2);
    assertEquals(user1Accounts[0].ownerId, user1.id);
    assertEquals(user1Accounts[1].ownerId, user1.id);

    // List user2's accounts
    const user2Accounts = await service.listCardAccounts(user2.id);
    assertEquals(user2Accounts.length, 1);
    assertEquals(user2Accounts[0].ownerId, user2.id);
  });
});

Deno.test({
  name: "CardAccount Integration - Get CardAccount with Ownership",
  sanitizeResources: false,
  sanitizeOps: false,
}, async () => {
  await withCleanDatabase(async () => {
    const user = await createTestUser();
    const service = new CardAccountService(
      new CardAccountRepository(),
      new CardAccountSettingsRepository(),
      new TransactionRepository()
    );

    const data = {
      name: "My Card",
      issuer: "Test Bank",
      last4: "1234",
      billingCycle: 15,
      creditLimitCents: 500000,
    };

    const { cardAccount } = await service.createCardAccount(data, user.id);

    // Get CardAccount
    const retrieved = await service.getCardAccount(cardAccount.id, user.id);

    assertExists(retrieved);
    assertEquals(retrieved.id, cardAccount.id);
    assertEquals(retrieved.name, data.name);
    assertEquals(retrieved.ownerId, user.id);
  });
});

Deno.test({
  name: "CardAccount Integration - Update CardAccount",
  sanitizeResources: false,
  sanitizeOps: false,
}, async () => {
  await withCleanDatabase(async () => {
    const user = await createTestUser();
    const service = new CardAccountService(
      new CardAccountRepository(),
      new CardAccountSettingsRepository(),
      new TransactionRepository()
    );

    const data = {
      name: "Original Name",
      issuer: "Test Bank",
      last4: "1234",
      billingCycle: 15,
      creditLimitCents: 500000,
    };

    const { cardAccount } = await service.createCardAccount(data, user.id);

    // Update CardAccount
    const updateData = {
      name: "Updated Name",
      creditLimitCents: 600000,
    };

    const updated = await service.updateCardAccount(
      cardAccount.id,
      updateData,
      user.id
    );

    assertEquals(updated.name, "Updated Name");
    assertEquals(updated.creditLimitCents, 600000);
    assertEquals(updated.issuer, data.issuer); // Unchanged
    assertEquals(updated.last4, data.last4); // Unchanged
  });
});

Deno.test({
  name: "CardAccount Integration - Soft Delete",
  sanitizeResources: false,
  sanitizeOps: false,
}, async () => {
  await withCleanDatabase(async () => {
    const user = await createTestUser();
    const service = new CardAccountService(
      new CardAccountRepository(),
      new CardAccountSettingsRepository(),
      new TransactionRepository()
    );

    const data = {
      name: "To Delete",
      issuer: "Test Bank",
      last4: "1234",
      billingCycle: 15,
      creditLimitCents: 500000,
    };

    const { cardAccount } = await service.createCardAccount(data, user.id);

    // Delete CardAccount
    await service.deleteCardAccount(cardAccount.id, user.id);

    // Verify it's no longer in the active list
    const accounts = await service.listCardAccounts(user.id);
    assertEquals(accounts.length, 0);
  });
});

Deno.test(
  {
    name: "CardAccount Integration - Delete Prevention with Transactions",
    sanitizeResources: false,
    sanitizeOps: false,
  },
  async () => {
    await withCleanDatabase(async () => {
      const user = await createTestUser();
      const merchant = await createTestMerchant();

      const cardAccountService = new CardAccountService(
        new CardAccountRepository(),
        new CardAccountSettingsRepository(),
        new TransactionRepository()
      );

      // Create CardAccount
      const { cardAccount } = await cardAccountService.createCardAccount(
        {
          name: "Account with Txns",
          issuer: "Test Bank",
          last4: "1234",
          billingCycle: 15,
          creditLimitCents: 500000,
        },
        user.id
      );

      // Create Transaction directly in database (skip service validation)
      await db.insert(Schemas.Tables.transactions).values({
        transactionDate: new Date(),
        amountCents: 5000,
        description: "Test Transaction",
        merchantId: merchant.id,
        type: "expense",
        cardAccountId: cardAccount.id,
        createdById: user.id,
      });

      // Try to delete CardAccount (should fail)
      let errorThrown = false;
      try {
        await cardAccountService.deleteCardAccount(cardAccount.id, user.id);
      } catch (error) {
        errorThrown = true;
        assert(error instanceof Error);
        assert(
          error.message.includes("transaction") ||
            error.message.includes("Cannot delete"),
          `Expected error about transactions, got: ${error.message}`
        );
      }

      assert(errorThrown, "Should have thrown error when deleting account with transactions");
    });
  }
);
