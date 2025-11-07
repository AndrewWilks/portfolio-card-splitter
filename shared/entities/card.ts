import { object, string } from "zod";
import { Entity, type EntityData } from "./base/entity.ts";

export interface CardData extends EntityData {
  cardAccountId: string;
  memberId?: string;
  nickname?: string;
  last4?: string;
  isActive: boolean;
}

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
