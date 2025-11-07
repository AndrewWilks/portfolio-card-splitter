import {
  CardAccountSettings,
  DEFAULT_AUSTRALIAN_SETTINGS,
  PRESETS,
} from "@shared/entities";
import { CardAccountSettingsRepository } from "@backend/repositories";
import { z } from "zod";

const UpdateSettingsRequestSchema = z.object({
  statementCloseDayOfMonth: z.number().int().min(1).max(31).optional(),
  statementFrequencyDays: z.number().int().positive().optional(),
  paymentDueDaysAfterClose: z.number().int().positive().optional(),
  interestFreeDays: z.number().int().positive().optional(),
  hasInterestFreePeriod: z.boolean().optional(),
  minimumPaymentPercentage: z.number().min(0.01).max(100).optional(),
  minimumPaymentFloorCents: z.number().int().positive().optional(),
  reminderDaysBeforeDue: z.number().int().min(0).optional(),
});

export type UpdateSettingsRequest = z.infer<typeof UpdateSettingsRequestSchema>;

export class CardAccountSettingsService {
  constructor(
    private cardAccountSettingsRepository: CardAccountSettingsRepository
  ) {}

  async getSettings(
    cardAccountId: string
  ): Promise<CardAccountSettings | null> {
    return await this.cardAccountSettingsRepository.findByCardAccountId(
      cardAccountId
    );
  }

  async updateSettings(
    cardAccountId: string,
    request: unknown
  ): Promise<CardAccountSettings> {
    const validated = UpdateSettingsRequestSchema.parse(request);

    const existing = await this.getSettings(cardAccountId);
    if (!existing) {
      throw new Error("CardAccountSettings not found");
    }

    // Create new entity with updated values (properties are readonly)
    const updated = new CardAccountSettings({
      id: existing.id,
      cardAccountId: existing.cardAccountId,
      statementCloseDayOfMonth:
        validated.statementCloseDayOfMonth ?? existing.statementCloseDayOfMonth,
      statementFrequencyDays:
        validated.statementFrequencyDays ?? existing.statementFrequencyDays,
      paymentDueDaysAfterClose:
        validated.paymentDueDaysAfterClose ?? existing.paymentDueDaysAfterClose,
      interestFreeDays: validated.interestFreeDays ?? existing.interestFreeDays,
      hasInterestFreePeriod:
        validated.hasInterestFreePeriod ?? existing.hasInterestFreePeriod,
      minimumPaymentPercentage:
        validated.minimumPaymentPercentage ?? existing.minimumPaymentPercentage,
      minimumPaymentFloorCents:
        validated.minimumPaymentFloorCents ?? existing.minimumPaymentFloorCents,
      reminderDaysBeforeDue:
        validated.reminderDaysBeforeDue ?? existing.reminderDaysBeforeDue,
      isActive: existing.isActive,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    const [saved] = await this.cardAccountSettingsRepository.save(updated);
    return saved;
  }

  async resetToDefaults(
    cardAccountId: string,
    preset?: "commbank" | "anz" | "westpac" | "nab"
  ): Promise<CardAccountSettings> {
    const existing = await this.getSettings(cardAccountId);
    if (!existing) {
      throw new Error("CardAccountSettings not found");
    }

    // Get defaults based on preset
    let defaults;
    if (preset) {
      const presetKey = preset.toUpperCase() as keyof typeof PRESETS;
      defaults = PRESETS[presetKey];
    } else {
      defaults = DEFAULT_AUSTRALIAN_SETTINGS;
    }

    // Create new entity with default values
    const reset = new CardAccountSettings({
      id: existing.id,
      cardAccountId: existing.cardAccountId,
      statementCloseDayOfMonth: defaults.statementCloseDayOfMonth,
      statementFrequencyDays: defaults.statementFrequencyDays,
      paymentDueDaysAfterClose: defaults.paymentDueDaysAfterClose,
      interestFreeDays: defaults.interestFreeDays,
      hasInterestFreePeriod: defaults.hasInterestFreePeriod,
      minimumPaymentPercentage: defaults.minimumPaymentPercentage,
      minimumPaymentFloorCents: defaults.minimumPaymentFloorCents,
      reminderDaysBeforeDue: defaults.reminderDaysBeforeDue,
      isActive: existing.isActive,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    const [updated] = await this.cardAccountSettingsRepository.save(reset);
    return updated;
  }
}
