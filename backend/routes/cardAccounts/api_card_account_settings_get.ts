import { Context } from "hono";
import { CardAccountSettingsService } from "@backend/services";

export async function apiCardAccountSettingsGet(
  c: Context,
  cardAccountSettingsService: CardAccountSettingsService
) {
  try {
    const cardAccountId = c.req.param("id");

    const settings = await cardAccountSettingsService.getSettings(
      cardAccountId
    );

    if (!settings) {
      return c.json({ error: "Settings not found" }, 404);
    }

    return c.json({
      settings: {
        id: settings.id,
        cardAccountId: settings.cardAccountId,
        statementCloseDayOfMonth: settings.statementCloseDayOfMonth,
        statementFrequencyDays: settings.statementFrequencyDays,
        paymentDueDaysAfterClose: settings.paymentDueDaysAfterClose,
        interestFreeDays: settings.interestFreeDays,
        hasInterestFreePeriod: settings.hasInterestFreePeriod,
        minimumPaymentPercentage: settings.minimumPaymentPercentage,
        minimumPaymentFloorCents: settings.minimumPaymentFloorCents,
        reminderDaysBeforeDue: settings.reminderDaysBeforeDue,
        isActive: settings.isActive,
        createdAt: settings.createdAt.toISOString(),
        updatedAt: settings.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
}
