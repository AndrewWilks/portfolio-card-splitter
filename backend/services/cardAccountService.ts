import { CardAccount, CardAccountSettings } from "@shared/entities";
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
    settingsOverrides?: Partial<{
      statementCloseDayOfMonth: number;
      statementFrequencyDays: number;
      paymentDueDaysAfterClose: number;
      interestFreeDays: number;
      hasInterestFreePeriod: boolean;
      minimumPaymentPercentage: number;
      minimumPaymentFloorCents: number;
      reminderDaysBeforeDue: number;
    }>
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
    const settings = new CardAccountSettings({
      cardAccountId: savedAccount.id,
      ...settingsOverrides, // Allow overriding defaults
    });

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

    // Apply updates
    if (validated.name !== undefined) existing.name = validated.name;
    if (validated.issuer !== undefined) existing.issuer = validated.issuer;
    if (validated.last4 !== undefined) existing.last4 = validated.last4;
    if (validated.billingCycle !== undefined)
      existing.billingCycle = validated.billingCycle;
    if (validated.creditLimitCents !== undefined)
      existing.creditLimitCents = validated.creditLimitCents;
    if (validated.isActive !== undefined && validated.isActive === false) {
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
    const transactions = await this.transactionRepository.findByCardAccountId(
      id
    );
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
