import { assert, assertEquals, assertExists } from "@std/assert";
import {
  CardAccountService,
  CardAccountSettingsService,
} from "../../services/index.ts";
import {
  CardAccountRepository,
  CardAccountSettingsRepository,
  TransactionRepository,
} from "../../repositories/index.ts";
import { createTestUser, withCleanDatabase } from "./testHelpers.ts";

Deno.test(
  {
    name: "CardAccountSettings Integration - Get Settings",
    sanitizeResources: false,
    sanitizeOps: false,
  },
  async () => {
    await withCleanDatabase(async () => {
      const user = await createTestUser();
      const cardAccountService = new CardAccountService(
        new CardAccountRepository(),
        new CardAccountSettingsRepository(),
        new TransactionRepository()
      );
      const settingsService = new CardAccountSettingsService(
        new CardAccountSettingsRepository()
      );

      // Create CardAccount (auto-creates settings)
      const { cardAccount } = await cardAccountService.createCardAccount(
        {
          name: "Test Card",
          issuer: "Test Bank",
          last4: "1234",
          billingCycle: 15,
          creditLimitCents: 500000,
        },
        user.id
      );

      // Get Settings
      const settings = await settingsService.getSettings(cardAccount.id);

      assertExists(settings);
      assertEquals(settings.cardAccountId, cardAccount.id);
      assertEquals(settings.statementCloseDayOfMonth, 15);
    });
  }
);

Deno.test(
  {
    name: "CardAccountSettings Integration - Update Settings",
    sanitizeResources: false,
    sanitizeOps: false,
  },
  async () => {
    await withCleanDatabase(async () => {
      const user = await createTestUser();
      const cardAccountService = new CardAccountService(
        new CardAccountRepository(),
        new CardAccountSettingsRepository(),
        new TransactionRepository()
      );
      const settingsService = new CardAccountSettingsService(
        new CardAccountSettingsRepository()
      );

      // Create CardAccount
      const { cardAccount } = await cardAccountService.createCardAccount(
        {
          name: "Test Card",
          issuer: "Test Bank",
          last4: "1234",
          billingCycle: 15,
          creditLimitCents: 500000,
        },
        user.id
      );

      // Update Settings
      const updateData = {
        statementCloseDayOfMonth: 20,
        paymentDueDaysAfterClose: 25,
      };

      const updated = await settingsService.updateSettings(
        cardAccount.id,
        updateData
      );

      assertEquals(updated.statementCloseDayOfMonth, 20);
      assertEquals(updated.paymentDueDaysAfterClose, 25);
      // Unchanged values
      assertEquals(updated.statementFrequencyDays, 30);
      assertEquals(updated.interestFreeDays, 55);
    });
  }
);

Deno.test(
  {
    name: "CardAccountSettings Integration - Reset to Defaults",
    sanitizeResources: false,
    sanitizeOps: false,
  },
  async () => {
    await withCleanDatabase(async () => {
      const user = await createTestUser();
      const cardAccountService = new CardAccountService(
        new CardAccountRepository(),
        new CardAccountSettingsRepository(),
        new TransactionRepository()
      );
      const settingsService = new CardAccountSettingsService(
        new CardAccountSettingsRepository()
      );

      // Create CardAccount
      const { cardAccount } = await cardAccountService.createCardAccount(
        {
          name: "Test Card",
          issuer: "Test Bank",
          last4: "1234",
          billingCycle: 15,
          creditLimitCents: 500000,
        },
        user.id
      );

      // Update to custom values
      await settingsService.updateSettings(cardAccount.id, {
        statementCloseDayOfMonth: 25,
        paymentDueDaysAfterClose: 30,
      });

      // Reset to defaults
      const reset = await settingsService.resetToDefaults(cardAccount.id);

      assertEquals(reset.statementCloseDayOfMonth, 15);
      assertEquals(reset.paymentDueDaysAfterClose, 21);
      assertEquals(reset.statementFrequencyDays, 30);
    });
  }
);

Deno.test(
  {
    name: "CardAccountSettings Integration - Reset with Preset",
    sanitizeResources: false,
    sanitizeOps: false,
  },
  async () => {
    await withCleanDatabase(async () => {
      const user = await createTestUser();
      const cardAccountService = new CardAccountService(
        new CardAccountRepository(),
        new CardAccountSettingsRepository(),
        new TransactionRepository()
      );
      const settingsService = new CardAccountSettingsService(
        new CardAccountSettingsRepository()
      );

      // Create CardAccount
      const { cardAccount } = await cardAccountService.createCardAccount(
        {
          name: "Test Card",
          issuer: "Test Bank",
          last4: "1234",
          billingCycle: 15,
          creditLimitCents: 500000,
        },
        user.id
      );

      // Reset to ANZ preset
      const reset = await settingsService.resetToDefaults(
        cardAccount.id,
        "anz"
      );

      assertEquals(reset.statementCloseDayOfMonth, 10); // ANZ preset value
      assert(reset.hasInterestFreePeriod);
    });
  }
);
