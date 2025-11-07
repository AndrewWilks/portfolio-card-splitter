import { assert, assertEquals, assertExists } from "@std/assert";
import {
  CardAccountService,
  CardService,
} from "../../services/index.ts";
import {
  CardAccountRepository,
  CardAccountSettingsRepository,
  CardRepository,
  TransactionRepository,
} from "../../repositories/index.ts";
import { createTestUser, createTestMember, withCleanDatabase } from "./testHelpers.ts";

Deno.test({
  name: "Card Integration - Create Card with CardAccount Validation",
  sanitizeResources: false,
  sanitizeOps: false,
}, async () => {
  await withCleanDatabase(async () => {
    const user = await createTestUser();
    const member = await createTestMember(user.id);

    const cardAccountService = new CardAccountService(
      new CardAccountRepository(),
      new CardAccountSettingsRepository(),
      new TransactionRepository()
    );
    const cardService = new CardService(
      new CardRepository(),
      new CardAccountRepository()
    );

    // Create CardAccount
    const { cardAccount } = await cardAccountService.createCardAccount(
      {
        name: "Test Account",
        issuer: "Test Bank",
        last4: "1234",
        billingCycle: 15,
        creditLimitCents: 500000,
      },
      user.id
    );

    // Create Card
    const cardData = {
      cardAccountId: cardAccount.id,
      memberId: member.id,
      nickname: "Primary Card",
      last4: "5678",
    };

    const card = await cardService.createCard(cardData);

    assertExists(card);
    assertEquals(card.cardAccountId, cardAccount.id);
    assertEquals(card.memberId, member.id);
    assertEquals(card.nickname, "Primary Card");
    assertEquals(card.last4, "5678");
    assert(card.isActive);
  });
});

Deno.test({
  name: "Card Integration - Create Card Fails if CardAccount Missing",
  sanitizeResources: false,
  sanitizeOps: false,
}, async () => {
  await withCleanDatabase(async () => {
    const user = await createTestUser();
    const member = await createTestMember(user.id);
    const cardService = new CardService(
      new CardRepository(),
      new CardAccountRepository()
    );

    // Try to create Card with invalid CardAccount
    let errorThrown = false;
    try {
      await cardService.createCard({
        cardAccountId: "00000000-0000-0000-0000-000000000000",
        memberId: member.id,
        nickname: "Invalid Card",
        last4: "0000",
      });
    } catch (error) {
      errorThrown = true;
      assert(error instanceof Error);
      assert(error.message.includes("CardAccount"));
    }

    assert(errorThrown, "Should have thrown error for missing CardAccount");
  });
});

Deno.test({
  name: "Card Integration - List Cards by CardAccount",
  sanitizeResources: false,
  sanitizeOps: false,
}, async () => {
  await withCleanDatabase(async () => {
    const user = await createTestUser();
    const member1 = await createTestMember(user.id);
    const member2 = await createTestMember(user.id);

    const cardAccountService = new CardAccountService(
      new CardAccountRepository(),
      new CardAccountSettingsRepository(),
      new TransactionRepository()
    );
    const cardService = new CardService(
      new CardRepository(),
      new CardAccountRepository()
    );

    // Create two CardAccounts
    const { cardAccount: account1 } = await cardAccountService.createCardAccount(
      {
        name: "Account 1",
        issuer: "Bank 1",
        last4: "1111",
        billingCycle: 15,
        creditLimitCents: 500000,
      },
      user.id
    );

    const { cardAccount: account2 } = await cardAccountService.createCardAccount(
      {
        name: "Account 2",
        issuer: "Bank 2",
        last4: "2222",
        billingCycle: 15,
        creditLimitCents: 500000,
      },
      user.id
    );

    // Create cards for account1
    await cardService.createCard({
      cardAccountId: account1.id,
      memberId: member1.id,
      nickname: "Card 1",
      last4: "1001",
    });

    await cardService.createCard({
      cardAccountId: account1.id,
      memberId: member2.id,
      nickname: "Card 2",
      last4: "1002",
    });

    // Create card for account2
    await cardService.createCard({
      cardAccountId: account2.id,
      memberId: member1.id,
      nickname: "Card 3",
      last4: "2001",
    });

    // List cards by account
    const account1Cards = await cardService.listCards(account1.id);
    assertEquals(account1Cards.length, 2);

    const account2Cards = await cardService.listCards(account2.id);
    assertEquals(account2Cards.length, 1);
  });
});

Deno.test({
  name: "Card Integration - List Cards by Member",
  sanitizeResources: false,
  sanitizeOps: false,
}, async () => {
  await withCleanDatabase(async () => {
    const user = await createTestUser();
    const member1 = await createTestMember(user.id);
    const member2 = await createTestMember(user.id);

    const cardAccountService = new CardAccountService(
      new CardAccountRepository(),
      new CardAccountSettingsRepository(),
      new TransactionRepository()
    );
    const cardService = new CardService(
      new CardRepository(),
      new CardAccountRepository()
    );

    // Create CardAccount
    const { cardAccount } = await cardAccountService.createCardAccount(
      {
        name: "Shared Account",
        issuer: "Test Bank",
        last4: "1234",
        billingCycle: 15,
        creditLimitCents: 500000,
      },
      user.id
    );

    // Create cards for different members
    await cardService.createCard({
      cardAccountId: cardAccount.id,
      memberId: member1.id,
      nickname: "Member 1 Card A",
      last4: "0001",
    });

    await cardService.createCard({
      cardAccountId: cardAccount.id,
      memberId: member1.id,
      nickname: "Member 1 Card B",
      last4: "0002",
    });

    await cardService.createCard({
      cardAccountId: cardAccount.id,
      memberId: member2.id,
      nickname: "Member 2 Card",
      last4: "0003",
    });

    // List by member
    const member1Cards = await cardService.listCardsByMember(member1.id);
    assertEquals(member1Cards.length, 2);

    const member2Cards = await cardService.listCardsByMember(member2.id);
    assertEquals(member2Cards.length, 1);
  });
});

Deno.test({
  name: "Card Integration - Update Card",
  sanitizeResources: false,
  sanitizeOps: false,
}, async () => {
  await withCleanDatabase(async () => {
    const user = await createTestUser();
    const member = await createTestMember(user.id);

    const cardAccountService = new CardAccountService(
      new CardAccountRepository(),
      new CardAccountSettingsRepository(),
      new TransactionRepository()
    );
    const cardService = new CardService(
      new CardRepository(),
      new CardAccountRepository()
    );

    // Create CardAccount and Card
    const { cardAccount } = await cardAccountService.createCardAccount(
      {
        name: "Test Account",
        issuer: "Test Bank",
        last4: "1234",
        billingCycle: 15,
        creditLimitCents: 500000,
      },
      user.id
    );

    const card = await cardService.createCard({
      cardAccountId: cardAccount.id,
      memberId: member.id,
      nickname: "Original Nickname",
      last4: "5678",
    });

    // Update Card
    const updated = await cardService.updateCard(card.id, {
      nickname: "Updated Nickname",
    });

    assertEquals(updated.nickname, "Updated Nickname");
    assertEquals(updated.last4, card.last4); // Unchanged
    assertEquals(updated.memberId, card.memberId); // Unchanged
  });
});

Deno.test({
  name: "Card Integration - Soft Delete Card",
  sanitizeResources: false,
  sanitizeOps: false,
}, async () => {
  await withCleanDatabase(async () => {
    const user = await createTestUser();
    const member = await createTestMember(user.id);

    const cardAccountService = new CardAccountService(
      new CardAccountRepository(),
      new CardAccountSettingsRepository(),
      new TransactionRepository()
    );
    const cardService = new CardService(
      new CardRepository(),
      new CardAccountRepository()
    );

    // Create CardAccount and Card
    const { cardAccount } = await cardAccountService.createCardAccount(
      {
        name: "Test Account",
        issuer: "Test Bank",
        last4: "1234",
        billingCycle: 15,
        creditLimitCents: 500000,
      },
      user.id
    );

    const card = await cardService.createCard({
      cardAccountId: cardAccount.id,
      memberId: member.id,
      nickname: "To Delete",
      last4: "5678",
    });

    // Delete Card
    await cardService.deleteCard(card.id);

    // Verify it's no longer in the active list
    const cards = await cardService.listCards(cardAccount.id);
    assertEquals(cards.length, 0);
  });
});
