import { Context } from "hono";
import { CardAccountSettingsService } from "@backend/services";
import { z } from "zod";

export async function apiCardAccountSettingsUpdate(
  c: Context,
  cardAccountSettingsService: CardAccountSettingsService
) {
  try {
    const cardAccountId = c.req.param("id");
    const body = await c.req.json();

    const settings = await cardAccountSettingsService.updateSettings(
      cardAccountId,
      body
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
      message: "Settings updated successfully",
    });
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
