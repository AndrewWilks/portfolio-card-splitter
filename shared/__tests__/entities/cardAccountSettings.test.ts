import { assertEquals, assertThrows } from "@std/assert";
import {
  CardAccountSettings,
  type CardAccountSettingsData,
  DEFAULT_AUSTRALIAN_SETTINGS,
  PRESETS,
} from "../../entities/cardAccountSettings.ts";

Deno.test(
  "CardAccountSettings - creates valid instance with required fields",
  () => {
    const data: CardAccountSettingsData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
      statementCloseDayOfMonth: 15,
      statementFrequencyDays: 30,
      paymentDueDaysAfterClose: 21,
      interestFreeDays: 55,
      hasInterestFreePeriod: true,
      minimumPaymentPercentage: 2,
      minimumPaymentFloorCents: 2500,
      reminderDaysBeforeDue: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const settings = new CardAccountSettings(data);

    assertEquals(settings.cardAccountId, data.cardAccountId);
    assertEquals(settings.statementCloseDayOfMonth, 15);
    assertEquals(settings.statementFrequencyDays, 30);
    assertEquals(settings.paymentDueDaysAfterClose, 21);
    assertEquals(settings.interestFreeDays, 55);
    assertEquals(settings.hasInterestFreePeriod, true);
    assertEquals(settings.minimumPaymentPercentage, 2);
    assertEquals(settings.minimumPaymentFloorCents, 2500);
    assertEquals(settings.reminderDaysBeforeDue, 3);
  }
);

Deno.test(
  "CardAccountSettings - creates with DEFAULT_AUSTRALIAN_SETTINGS",
  () => {
    const data: CardAccountSettingsData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
      ...DEFAULT_AUSTRALIAN_SETTINGS,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const settings = new CardAccountSettings(data);

    assertEquals(settings.statementCloseDayOfMonth, 15);
    assertEquals(settings.statementFrequencyDays, 30);
    assertEquals(settings.paymentDueDaysAfterClose, 21);
    assertEquals(settings.interestFreeDays, 55);
    assertEquals(settings.hasInterestFreePeriod, true);
  }
);

Deno.test("CardAccountSettings - creates with COMMBANK preset", () => {
  const data: CardAccountSettingsData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    ...PRESETS.COMMBANK,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const settings = new CardAccountSettings(data);

  assertEquals(settings.statementCloseDayOfMonth, 15);
  assertEquals(settings.interestFreeDays, 55);
});

Deno.test("CardAccountSettings - creates with ANZ preset", () => {
  const data: CardAccountSettingsData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    ...PRESETS.ANZ,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const settings = new CardAccountSettings(data);

  assertEquals(settings.statementCloseDayOfMonth, 10); // Different from default
});

Deno.test("CardAccountSettings - creates with WESTPAC preset", () => {
  const data: CardAccountSettingsData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    ...PRESETS.WESTPAC,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const settings = new CardAccountSettings(data);

  assertEquals(settings.interestFreeDays, 44); // Different from default
});

Deno.test("CardAccountSettings - creates with NAB preset", () => {
  const data: CardAccountSettingsData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    ...PRESETS.NAB,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const settings = new CardAccountSettings(data);

  assertEquals(settings.paymentDueDaysAfterClose, 25); // Different from default
});

Deno.test(
  "CardAccountSettings - throws error when cardAccountId is missing",
  () => {
    const data = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      statementCloseDayOfMonth: 15,
      statementFrequencyDays: 30,
      paymentDueDaysAfterClose: 21,
      interestFreeDays: 55,
      hasInterestFreePeriod: true,
      minimumPaymentPercentage: 2,
      minimumPaymentFloorCents: 2500,
      reminderDaysBeforeDue: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Partial<CardAccountSettingsData> as CardAccountSettingsData;

    assertThrows(() => new CardAccountSettings(data));
  }
);

Deno.test(
  "CardAccountSettings - throws error when cardAccountId is invalid UUID",
  () => {
    const data: CardAccountSettingsData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      cardAccountId: "not-a-uuid",
      ...DEFAULT_AUSTRALIAN_SETTINGS,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    assertThrows(() => new CardAccountSettings(data));
  }
);

Deno.test(
  "CardAccountSettings - throws error when statementCloseDayOfMonth is 0",
  () => {
    const data: CardAccountSettingsData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
      statementCloseDayOfMonth: 0,
      statementFrequencyDays: 30,
      paymentDueDaysAfterClose: 21,
      interestFreeDays: 55,
      hasInterestFreePeriod: true,
      minimumPaymentPercentage: 2,
      minimumPaymentFloorCents: 2500,
      reminderDaysBeforeDue: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    assertThrows(() => new CardAccountSettings(data));
  }
);

Deno.test(
  "CardAccountSettings - throws error when statementCloseDayOfMonth is 32",
  () => {
    const data: CardAccountSettingsData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
      statementCloseDayOfMonth: 32,
      statementFrequencyDays: 30,
      paymentDueDaysAfterClose: 21,
      interestFreeDays: 55,
      hasInterestFreePeriod: true,
      minimumPaymentPercentage: 2,
      minimumPaymentFloorCents: 2500,
      reminderDaysBeforeDue: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    assertThrows(() => new CardAccountSettings(data));
  }
);

Deno.test("CardAccountSettings - accepts statementCloseDayOfMonth 1", () => {
  const data: CardAccountSettingsData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    statementCloseDayOfMonth: 1,
    statementFrequencyDays: 30,
    paymentDueDaysAfterClose: 21,
    interestFreeDays: 55,
    hasInterestFreePeriod: true,
    minimumPaymentPercentage: 2,
    minimumPaymentFloorCents: 2500,
    reminderDaysBeforeDue: 3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const settings = new CardAccountSettings(data);
  assertEquals(settings.statementCloseDayOfMonth, 1);
});

Deno.test("CardAccountSettings - accepts statementCloseDayOfMonth 31", () => {
  const data: CardAccountSettingsData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    statementCloseDayOfMonth: 31,
    statementFrequencyDays: 30,
    paymentDueDaysAfterClose: 21,
    interestFreeDays: 55,
    hasInterestFreePeriod: true,
    minimumPaymentPercentage: 2,
    minimumPaymentFloorCents: 2500,
    reminderDaysBeforeDue: 3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const settings = new CardAccountSettings(data);
  assertEquals(settings.statementCloseDayOfMonth, 31);
});

Deno.test(
  "CardAccountSettings - throws error when statementFrequencyDays is 0",
  () => {
    const data: CardAccountSettingsData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
      statementCloseDayOfMonth: 15,
      statementFrequencyDays: 0,
      paymentDueDaysAfterClose: 21,
      interestFreeDays: 55,
      hasInterestFreePeriod: true,
      minimumPaymentPercentage: 2,
      minimumPaymentFloorCents: 2500,
      reminderDaysBeforeDue: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    assertThrows(() => new CardAccountSettings(data));
  }
);

Deno.test(
  "CardAccountSettings - throws error when paymentDueDaysAfterClose is 0",
  () => {
    const data: CardAccountSettingsData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
      statementCloseDayOfMonth: 15,
      statementFrequencyDays: 30,
      paymentDueDaysAfterClose: 0,
      interestFreeDays: 55,
      hasInterestFreePeriod: true,
      minimumPaymentPercentage: 2,
      minimumPaymentFloorCents: 2500,
      reminderDaysBeforeDue: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    assertThrows(() => new CardAccountSettings(data));
  }
);

Deno.test(
  "CardAccountSettings - throws error when interestFreeDays is 0",
  () => {
    const data: CardAccountSettingsData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
      statementCloseDayOfMonth: 15,
      statementFrequencyDays: 30,
      paymentDueDaysAfterClose: 21,
      interestFreeDays: 0,
      hasInterestFreePeriod: true,
      minimumPaymentPercentage: 2,
      minimumPaymentFloorCents: 2500,
      reminderDaysBeforeDue: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    assertThrows(() => new CardAccountSettings(data));
  }
);

Deno.test(
  "CardAccountSettings - throws error when minimumPaymentPercentage is 0",
  () => {
    const data: CardAccountSettingsData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
      statementCloseDayOfMonth: 15,
      statementFrequencyDays: 30,
      paymentDueDaysAfterClose: 21,
      interestFreeDays: 55,
      hasInterestFreePeriod: true,
      minimumPaymentPercentage: 0,
      minimumPaymentFloorCents: 2500,
      reminderDaysBeforeDue: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    assertThrows(() => new CardAccountSettings(data));
  }
);

Deno.test("CardAccountSettings - accepts minimumPaymentPercentage 0.01", () => {
  const data: CardAccountSettingsData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    statementCloseDayOfMonth: 15,
    statementFrequencyDays: 30,
    paymentDueDaysAfterClose: 21,
    interestFreeDays: 55,
    hasInterestFreePeriod: true,
    minimumPaymentPercentage: 0.01,
    minimumPaymentFloorCents: 2500,
    reminderDaysBeforeDue: 3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const settings = new CardAccountSettings(data);
  assertEquals(settings.minimumPaymentPercentage, 0.01);
});

Deno.test("CardAccountSettings - accepts minimumPaymentPercentage 100", () => {
  const data: CardAccountSettingsData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    statementCloseDayOfMonth: 15,
    statementFrequencyDays: 30,
    paymentDueDaysAfterClose: 21,
    interestFreeDays: 55,
    hasInterestFreePeriod: true,
    minimumPaymentPercentage: 100,
    minimumPaymentFloorCents: 2500,
    reminderDaysBeforeDue: 3,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const settings = new CardAccountSettings(data);
  assertEquals(settings.minimumPaymentPercentage, 100);
});

Deno.test(
  "CardAccountSettings - throws error when minimumPaymentPercentage is 100.01",
  () => {
    const data: CardAccountSettingsData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
      statementCloseDayOfMonth: 15,
      statementFrequencyDays: 30,
      paymentDueDaysAfterClose: 21,
      interestFreeDays: 55,
      hasInterestFreePeriod: true,
      minimumPaymentPercentage: 100.01,
      minimumPaymentFloorCents: 2500,
      reminderDaysBeforeDue: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    assertThrows(() => new CardAccountSettings(data));
  }
);

Deno.test(
  "CardAccountSettings - throws error when minimumPaymentFloorCents is 0",
  () => {
    const data: CardAccountSettingsData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
      statementCloseDayOfMonth: 15,
      statementFrequencyDays: 30,
      paymentDueDaysAfterClose: 21,
      interestFreeDays: 55,
      hasInterestFreePeriod: true,
      minimumPaymentPercentage: 2,
      minimumPaymentFloorCents: 0,
      reminderDaysBeforeDue: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    assertThrows(() => new CardAccountSettings(data));
  }
);

Deno.test("CardAccountSettings - accepts reminderDaysBeforeDue 0", () => {
  const data: CardAccountSettingsData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    statementCloseDayOfMonth: 15,
    statementFrequencyDays: 30,
    paymentDueDaysAfterClose: 21,
    interestFreeDays: 55,
    hasInterestFreePeriod: true,
    minimumPaymentPercentage: 2,
    minimumPaymentFloorCents: 2500,
    reminderDaysBeforeDue: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const settings = new CardAccountSettings(data);
  assertEquals(settings.reminderDaysBeforeDue, 0);
});

Deno.test("CardAccountSettings - calculateDueDate adds correct days", () => {
  const data: CardAccountSettingsData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    ...DEFAULT_AUSTRALIAN_SETTINGS,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const settings = new CardAccountSettings(data);
  const closeDate = new Date(2024, 0, 15); // Jan 15, 2024
  const dueDate = settings.calculateDueDate(closeDate);

  assertEquals(dueDate.getDate(), 5); // Jan 15 + 21 days = Feb 5
  assertEquals(dueDate.getMonth(), 1); // February (0-indexed)
});

Deno.test(
  "CardAccountSettings - calculateStatementCloseDate handles regular month",
  () => {
    const data: CardAccountSettingsData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
      ...DEFAULT_AUSTRALIAN_SETTINGS,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const settings = new CardAccountSettings(data);
    const closeDate = settings.calculateStatementCloseDate(2024, 0); // January 2024

    assertEquals(closeDate.getDate(), 15);
    assertEquals(closeDate.getMonth(), 0);
    assertEquals(closeDate.getFullYear(), 2024);
  }
);

Deno.test(
  "CardAccountSettings - calculateStatementCloseDate handles February edge case",
  () => {
    const data: CardAccountSettingsData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
      statementCloseDayOfMonth: 31, // Request 31st
      statementFrequencyDays: 30,
      paymentDueDaysAfterClose: 21,
      interestFreeDays: 55,
      hasInterestFreePeriod: true,
      minimumPaymentPercentage: 2,
      minimumPaymentFloorCents: 2500,
      reminderDaysBeforeDue: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const settings = new CardAccountSettings(data);
    const closeDate = settings.calculateStatementCloseDate(2024, 1); // February 2024 (leap year)

    assertEquals(closeDate.getDate(), 29); // Feb has max 29 days in 2024
    assertEquals(closeDate.getMonth(), 1);
  }
);

Deno.test(
  "CardAccountSettings - calculateStatementCloseDate handles non-leap February",
  () => {
    const data: CardAccountSettingsData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
      statementCloseDayOfMonth: 31,
      statementFrequencyDays: 30,
      paymentDueDaysAfterClose: 21,
      interestFreeDays: 55,
      hasInterestFreePeriod: true,
      minimumPaymentPercentage: 2,
      minimumPaymentFloorCents: 2500,
      reminderDaysBeforeDue: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const settings = new CardAccountSettings(data);
    const closeDate = settings.calculateStatementCloseDate(2023, 1); // February 2023 (non-leap)

    assertEquals(closeDate.getDate(), 28); // Feb has max 28 days in 2023
    assertEquals(closeDate.getMonth(), 1);
  }
);

Deno.test(
  "CardAccountSettings - isInInterestFreePeriod returns true within period",
  () => {
    const data: CardAccountSettingsData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
      ...DEFAULT_AUSTRALIAN_SETTINGS,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const settings = new CardAccountSettings(data);
    const transactionDate = new Date(2024, 0, 1); // Jan 1
    const paymentDate = new Date(2024, 1, 24); // Feb 24 (54 days later)

    assertEquals(
      settings.isInInterestFreePeriod(transactionDate, paymentDate),
      true
    );
  }
);

Deno.test(
  "CardAccountSettings - isInInterestFreePeriod returns false after period",
  () => {
    const data: CardAccountSettingsData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
      ...DEFAULT_AUSTRALIAN_SETTINGS,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const settings = new CardAccountSettings(data);
    const transactionDate = new Date(2024, 0, 1); // Jan 1
    const paymentDate = new Date(2024, 1, 26); // Feb 26 (56 days later)

    assertEquals(
      settings.isInInterestFreePeriod(transactionDate, paymentDate),
      false
    );
  }
);

Deno.test(
  "CardAccountSettings - isInInterestFreePeriod returns false when disabled",
  () => {
    const data: CardAccountSettingsData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
      statementCloseDayOfMonth: 15,
      statementFrequencyDays: 30,
      paymentDueDaysAfterClose: 21,
      interestFreeDays: 55,
      hasInterestFreePeriod: false, // Disabled
      minimumPaymentPercentage: 2,
      minimumPaymentFloorCents: 2500,
      reminderDaysBeforeDue: 3,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const settings = new CardAccountSettings(data);
    const transactionDate = new Date(2024, 0, 1);
    const paymentDate = new Date(2024, 0, 2); // Only 1 day later

    assertEquals(
      settings.isInInterestFreePeriod(transactionDate, paymentDate),
      false
    );
  }
);

Deno.test(
  "CardAccountSettings - calculateMinimumPaymentCents uses percentage when higher",
  () => {
    const data: CardAccountSettingsData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
      ...DEFAULT_AUSTRALIAN_SETTINGS,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const settings = new CardAccountSettings(data);
    const balanceCents = 500000; // $5000
    const minPayment = settings.calculateMinimumPaymentCents(balanceCents);

    assertEquals(minPayment, 10000); // 2% of $5000 = $100
  }
);

Deno.test(
  "CardAccountSettings - calculateMinimumPaymentCents uses floor when higher",
  () => {
    const data: CardAccountSettingsData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
      ...DEFAULT_AUSTRALIAN_SETTINGS,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const settings = new CardAccountSettings(data);
    const balanceCents = 5000; // $50 (balance < floor)
    const minPayment = settings.calculateMinimumPaymentCents(balanceCents);

    assertEquals(minPayment, 2500); // Floor of $25
  }
);

Deno.test(
  "CardAccountSettings - calculateMinimumPaymentCents rounds up",
  () => {
    const data: CardAccountSettingsData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
      ...DEFAULT_AUSTRALIAN_SETTINGS,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const settings = new CardAccountSettings(data);
    const balanceCents = 333333; // $3333.33
    const minPayment = settings.calculateMinimumPaymentCents(balanceCents);

    assertEquals(minPayment, 6667); // 2% = $66.67 rounded up to $66.67
  }
);

Deno.test(
  "CardAccountSettings - getNextStatementCloseDate advances correctly",
  () => {
    const data: CardAccountSettingsData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
      ...DEFAULT_AUSTRALIAN_SETTINGS,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const settings = new CardAccountSettings(data);
    const currentClose = new Date(2024, 0, 15); // Jan 15, 2024
    const nextClose = settings.getNextStatementCloseDate(currentClose);

    assertEquals(nextClose.getDate(), 15); // Should be 15th
    assertEquals(nextClose.getMonth(), 1); // February
  }
);

Deno.test("CardAccountSettings - archive toggles isActive", () => {
  const data: CardAccountSettingsData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    ...DEFAULT_AUSTRALIAN_SETTINGS,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const settings = new CardAccountSettings(data);
  assertEquals(settings.isActive, true);

  settings.archive();
  assertEquals(settings.isActive, false);
});

Deno.test("CardAccountSettings - toJSON includes all fields", () => {
  const data: CardAccountSettingsData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    ...DEFAULT_AUSTRALIAN_SETTINGS,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const settings = new CardAccountSettings(data);
  const json = settings.toJSON;

  assertEquals(json.id, data.id);
  assertEquals(json.cardAccountId, data.cardAccountId);
  assertEquals(json.statementCloseDayOfMonth, 15);
  assertEquals(json.statementFrequencyDays, 30);
  assertEquals(json.paymentDueDaysAfterClose, 21);
  assertEquals(json.interestFreeDays, 55);
  assertEquals(json.hasInterestFreePeriod, true);
  assertEquals(json.minimumPaymentPercentage, 2);
  assertEquals(json.minimumPaymentFloorCents, 2500);
  assertEquals(json.reminderDaysBeforeDue, 3);
  assertEquals(json.isActive, true);
});

Deno.test("CardAccountSettings - parse reconstructs from valid data", () => {
  const data = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    ...DEFAULT_AUSTRALIAN_SETTINGS,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const settings = CardAccountSettings.parse(data);

  assertEquals(settings.cardAccountId, data.cardAccountId);
  assertEquals(settings.statementCloseDayOfMonth, 15);
});

Deno.test("CardAccountSettings - parse throws on invalid data", () => {
  const data = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "not-a-uuid",
    ...DEFAULT_AUSTRALIAN_SETTINGS,
  };

  assertThrows(() => CardAccountSettings.parse(data));
});
