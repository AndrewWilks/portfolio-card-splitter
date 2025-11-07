import {
  CardAccount,
  CardAccountSettings,
  CardAccountSettingsData,
} from "@shared/entities";
import {
  CardAccountRepository,
  CardAccountSettingsRepository,
  TransactionRepository,
} from "@backend/repositories";
import { z } from "zod";

// Request schemas
const CreateCardAccountRequestSchema = z.object({
  name: z.string().min(1).max(255),
  issuer: z.string().min(1).max(255),
  last4: z
    .string()
    .length(4)
    .regex(/^\d{4}$/),
  billingCycle: z.number().int().min(1).max(31),
  creditLimitCents: z.number().int().positive().optional(),
});

const UpdateCardAccountRequestSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  issuer: z.string().min(1).max(255).optional(),
  last4: z
    .string()
    .length(4)
    .regex(/^\d{4}$/)
    .optional(),
  billingCycle: z.number().int().min(1).max(31).optional(),
  creditLimitCents: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

export type CreateCardAccountRequest = z.infer<
  typeof CreateCardAccountRequestSchema
>;
export type UpdateCardAccountRequest = z.infer<
  typeof UpdateCardAccountRequestSchema
>;

export class CardAccountService {
  constructor(
    private cardAccountRepository: CardAccountRepository,
    private cardAccountSettingsRepository: CardAccountSettingsRepository,
    private transactionRepository: TransactionRepository
  ) {}

  async createCardAccount(
    request: unknown,
    ownerId: string,
    settingsOverrides?: Partial<CardAccountSettingsData>
  ): Promise<{ cardAccount: CardAccount; settings: CardAccountSettings }> {
    const validated = CreateCardAccountRequestSchema.parse(request);

    // Create CardAccount
    const cardAccount = new CardAccount({
      name: validated.name,
      issuer: validated.issuer,
      last4: validated.last4,
      billingCycle: validated.billingCycle,
      creditLimitCents: validated.creditLimitCents,
      ownerId,
      isActive: true,
    });

    const [savedAccount] = await this.cardAccountRepository.save(cardAccount);

    // Create default settings
    const defaultSettings = {
      cardAccountId: savedAccount.id,
      statementCloseDayOfMonth: 15,
      statementFrequencyDays: 30,
      paymentDueDaysAfterClose: 21,
      interestFreeDays: 55,
      hasInterestFreePeriod: true,
      minimumPaymentPercentage: 2,
      minimumPaymentFloorCents: 2500,
      reminderDaysBeforeDue: 3,
      isActive: true,
      ...settingsOverrides,
    };
    const settings = new CardAccountSettings(defaultSettings);

    const [savedSettings] = await this.cardAccountSettingsRepository.save(
      settings
    );

    return {
      cardAccount: savedAccount,
      settings: savedSettings,
    };
  }

  async listCardAccounts(ownerId: string): Promise<CardAccount[]> {
    return await this.cardAccountRepository.findActiveByOwnerId(ownerId);
  }

  async getCardAccount(
    id: string,
    ownerId: string
  ): Promise<CardAccount | null> {
    const cardAccount = await this.cardAccountRepository.findById(id);

    if (!cardAccount) {
      return null;
    }

    // Ownership check
    if (cardAccount.ownerId !== ownerId) {
      throw new Error("Unauthorized: CardAccount does not belong to user");
    }

    return cardAccount;
  }

  async updateCardAccount(
    id: string,
    request: unknown,
    ownerId: string
  ): Promise<CardAccount> {
    const validated = UpdateCardAccountRequestSchema.parse(request);

    const existing = await this.getCardAccount(id, ownerId);

    if (!existing) {
      throw new Error("CardAccount not found");
    }

    const existingData = existing.toJSON;

    // Apply updates
    if (validated.name !== undefined) existingData.name = validated.name;
    if (validated.issuer !== undefined) existingData.issuer = validated.issuer;
    if (validated.last4 !== undefined) existingData.last4 = validated.last4;
    if (validated.billingCycle !== undefined)
      existingData.billingCycle = validated.billingCycle;
    if (existingData.creditLimitCents !== undefined)
      existingData.creditLimitCents = validated.creditLimitCents;
    if (existingData.isActive !== undefined && validated.isActive === false) {
      existing.toggleActive();
    }

    const [updated] = await this.cardAccountRepository.save(existing);
    return updated;
  }

  async deleteCardAccount(id: string, ownerId: string): Promise<void> {
    const cardAccount = await this.getCardAccount(id, ownerId);
    if (!cardAccount) {
      throw new Error("CardAccount not found");
    }

    // Check if CardAccount has transactions
    const transactions = await this.transactionRepository.findByQuery({
      cardAccountId: id,
    });
    if (transactions && transactions.length > 0) {
      throw new Error(
        "Cannot delete CardAccount with transactions. Archive instead."
      );
    }

    // Soft delete
    cardAccount.toggleActive();
    await this.cardAccountRepository.save(cardAccount);
  }
}
