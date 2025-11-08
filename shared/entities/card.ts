import { object, string } from "zod";
import { Entity, type EntityData } from "./base/entity.ts";

/**
 * Card Data Interface
 *
 * Represents a physical or virtual card number within a CardAccount.
 * Used for attribution (tracking "who swiped") in shared household scenarios.
 *
 * @interface CardData
 * @extends EntityData
 *
 * @property {string} cardAccountId - UUID of the parent CardAccount
 * @property {string} [memberId] - UUID of the Member who typically uses this card (optional)
 * @property {string} [nickname] - User-friendly name (e.g., "Alice's card", "Virtual #1")
 * @property {string} [last4] - Last 4 digits of the card number (optional, may differ from account)
 * @property {boolean} isActive - Soft delete flag; false = archived
 *
 * @example
 * ```typescript
 * const cardData: CardData = {
 *   id: "card-uuid",
 *   cardAccountId: "account-uuid",
 *   memberId: "member-uuid",
 *   nickname: "Alice's Primary Card",
 *   last4: "5678", // May differ from CardAccount.last4
 *   isActive: true,
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * };
 * ```
 *
 * @remarks
 * - Cards are OPTIONAL - Transactions can exist without Card attribution
 * - Cards don't affect splits or payments, only used for attribution/tracking
 * - Useful for multi-card households to see "who used which card"
 * - Multiple Cards can belong to the same CardAccount
 * - Card.last4 may differ from CardAccount.last4 (multiple physical/virtual cards)
 *
 * @see {@link CardAccount} - Parent entity; one CardAccount has many Cards
 * @see {@link Transaction} - Can optionally reference a Card via `cardId`
 * @see {@link Member} - Card can be associated with a Member for household tracking
 */
export interface CardData extends EntityData {
  cardAccountId: string;
  memberId?: string;
  nickname?: string;
  last4?: string;
  isActive: boolean;
}

/**
 * Card Entity
 *
 * Represents an individual card (physical or virtual) within a CardAccount.
 * Provides attribution for household expense tracking without affecting splits.
 *
 * @class Card
 * @extends Entity
 *
 * @remarks
 * Key relationships:
 * - One CardAccount has many Cards (N:1)
 * - One Member may have many Cards (N:1) - optional association
 * - Transactions can optionally reference a Card (N:1)
 *
 * Business rules:
 * - `nickname` is trimmed on construction if provided
 * - Card must belong to a valid CardAccount
 * - Card is optional for Transactions - purely for attribution
 * - Soft deleted via `isActive=false` rather than hard delete
 * - Does NOT affect payment splits or allocations
 *
 * @example
 * ```typescript
 * const card = new Card({
 *   id: "card-uuid",
 *   cardAccountId: "account-uuid",
 *   memberId: "alice-uuid",
 *   nickname: "  Alice's Card  ", // Will be trimmed
 *   last4: "5678",
 *   isActive: true,
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * });
 *
 * console.log(card.nickname); // "Alice's Card" (trimmed)
 * console.log(card.memberId); // "alice-uuid"
 * ```
 */
export class Card extends Entity {
  private _cardAccountId: string;
  private _memberId?: string;
  private _nickname?: string;
  private _last4?: string;

  constructor(data: CardData) {
    super(data);
    const validated = Card.schema.parse(data);
    this._cardAccountId = validated.cardAccountId;
    this._memberId = validated.memberId;
    this._nickname = validated.nickname?.trim();
    this._last4 = validated.last4;
  }

  get cardAccountId(): string {
    return this._cardAccountId;
  }

  get memberId(): string | undefined {
    return this._memberId;
  }

  get nickname(): string | undefined {
    return this._nickname;
  }

  get last4(): string | undefined {
    return this._last4;
  }

  get displayName(): string {
    if (this._nickname) {
      return this._last4
        ? `${this._nickname} (••${this._last4})`
        : this._nickname;
    }
    return this._last4 ? `Card ••${this._last4}` : "Card";
  }

  canDelete(): boolean {
    // Placeholder - actual check in service layer (needs transaction repository)
    // Cannot delete if any transactions reference this card
    return true;
  }

  archive(): void {
    this.toggleActive();
  }

  override get toJSON() {
    return {
      ...super.toJSON,
      cardAccountId: this._cardAccountId,
      memberId: this._memberId,
      nickname: this._nickname,
      last4: this._last4,
    };
  }

  static parse(data: unknown): Card {
    const validated = this.bodySchema.parse(data);
    return new Card(validated);
  }

  static get schema() {
    return object({
      cardAccountId: string().uuid(),
      memberId: string().uuid().optional(),
      nickname: string().min(1).max(100).trim().optional(),
      last4: string()
        .length(4)
        .regex(/^\d{4}$/, "Must be 4 digits")
        .optional(),
    });
  }

  static readonly createSchema = this.schema;

  static override get bodySchema() {
    return super.bodySchema.extend(this.schema.shape);
  }
}
