import { Context } from "hono";
import { CardAccountSettingsService } from "@backend/services";

export async function apiCardAccountSettingsReset(
  c: Context,
  cardAccountSettingsService: CardAccountSettingsService
) {
  try {
    const cardAccountId = c.req.param("id");
    const preset = c.req.query("preset") as
      | "commbank"
      | "anz"
      | "westpac"
      | "nab"
      | undefined;

    const settings = await cardAccountSettingsService.resetToDefaults(
      cardAccountId,
      preset
    );

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
      message: `Settings reset to ${preset || "default"} preset`,
    });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
}
