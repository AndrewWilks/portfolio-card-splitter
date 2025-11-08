import { Card } from "@shared/entities";
import { CardRepository, CardAccountRepository } from "@backend/repositories";
import { z } from "zod";

const CreateCardRequestSchema = z.object({
  cardAccountId: z.string().uuid(),
  memberId: z.string().uuid().optional(),
  nickname: z.string().max(100).optional(),
  last4: z
    .string()
    .length(4)
    .regex(/^\d{4}$/)
    .optional(),
});

const UpdateCardRequestSchema = z.object({
  memberId: z.string().uuid().optional().nullable(),
  nickname: z.string().max(100).optional(),
  last4: z
    .string()
    .length(4)
    .regex(/^\d{4}$/)
    .optional(),
  isActive: z.boolean().optional(),
});

export type CreateCardRequest = z.infer<typeof CreateCardRequestSchema>;
export type UpdateCardRequest = z.infer<typeof UpdateCardRequestSchema>;

export class CardService {
  constructor(
    private cardRepository: CardRepository,
    private cardAccountRepository: CardAccountRepository
  ) {}

  async createCard(request: unknown): Promise<Card> {
    const validated = CreateCardRequestSchema.parse(request);

    // Validate CardAccount exists
    const cardAccount = await this.cardAccountRepository.findById(
      validated.cardAccountId
    );
    if (!cardAccount) {
      throw new Error("CardAccount not found");
    }

    const card = new Card({
      cardAccountId: validated.cardAccountId,
      memberId: validated.memberId,
      nickname: validated.nickname,
      last4: validated.last4,
      isActive: true,
    });

    const [saved] = await this.cardRepository.save(card);
    return saved;
  }

  async listCards(cardAccountId: string): Promise<Card[]> {
    return await this.cardRepository.findActiveByCardAccountId(cardAccountId);
  }

  async listCardsByMember(memberId: string): Promise<Card[]> {
    return await this.cardRepository.findByMemberId(memberId);
  }

  async getCard(id: string): Promise<Card | null> {
    return await this.cardRepository.findById(id);
  }

  async updateCard(id: string, request: unknown): Promise<Card> {
    const validated = UpdateCardRequestSchema.parse(request);

    const existing = await this.getCard(id);
    if (!existing) {
      throw new Error("Card not found");
    }

    // Create updated entity (properties are readonly)
    const updated = new Card({
      id: existing.id,
      cardAccountId: existing.cardAccountId,
      memberId: validated.memberId ?? existing.memberId,
      nickname: validated.nickname ?? existing.nickname,
      last4: validated.last4 ?? existing.last4,
      isActive:
        validated.isActive !== undefined
          ? validated.isActive
          : existing.isActive,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    });

    const [saved] = await this.cardRepository.save(updated);
    return saved;
  }

  async deleteCard(id: string): Promise<void> {
    const card = await this.getCard(id);
    if (!card) {
      throw new Error("Card not found");
    }

    // Soft delete
    card.toggleActive();
    await this.cardRepository.save(card);
  }
}
