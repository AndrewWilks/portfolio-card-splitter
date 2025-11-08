import { Context } from "hono";
import { CardAccountService } from "@backend/services";
import { z } from "zod";

export async function apiCardAccountsCreate(
  c: Context,
  cardAccountService: CardAccountService
) {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();

    // Optional settings overrides
    const settingsOverrides = body.settings || undefined;

    const result = await cardAccountService.createCardAccount(
      body,
      user.id,
      settingsOverrides
    );

    return c.json(
      {
        cardAccount: {
          id: result.cardAccount.id,
          name: result.cardAccount.name,
          issuer: result.cardAccount.issuer,
          last4: result.cardAccount.last4,
          billingCycle: result.cardAccount.billingCycle,
          creditLimitCents: result.cardAccount.creditLimitCents,
          ownerId: result.cardAccount.ownerId,
          isActive: result.cardAccount.isActive,
          createdAt: result.cardAccount.createdAt.toISOString(),
          updatedAt: result.cardAccount.updatedAt.toISOString(),
        },
        settings: {
          id: result.settings.id,
          cardAccountId: result.settings.cardAccountId,
          statementCloseDayOfMonth: result.settings.statementCloseDayOfMonth,
          statementFrequencyDays: result.settings.statementFrequencyDays,
          paymentDueDaysAfterClose: result.settings.paymentDueDaysAfterClose,
          interestFreeDays: result.settings.interestFreeDays,
          hasInterestFreePeriod: result.settings.hasInterestFreePeriod,
          minimumPaymentPercentage: result.settings.minimumPaymentPercentage,
          minimumPaymentFloorCents: result.settings.minimumPaymentFloorCents,
          reminderDaysBeforeDue: result.settings.reminderDaysBeforeDue,
          isActive: result.settings.isActive,
          createdAt: result.settings.createdAt.toISOString(),
          updatedAt: result.settings.updatedAt.toISOString(),
        },
        message: "CardAccount and settings created successfully",
      },
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: "Validation failed", details: error.issues }, 400);
    }
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
}
