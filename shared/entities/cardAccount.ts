import { number, object, string, uuid, z } from "zod";
import { Entity, type EntityData } from "./base/entity.ts";

export interface CardAccountData extends EntityData {
  name: string;
  issuer: string;
  last4: string;
  billingCycle: number;
  creditLimitCents?: number;
  ownerId: string;
  isActive: boolean;
}

export class CardAccount extends Entity {
  private _name: string;
  private _issuer: string;
  private _last4: string;
  private _billingCycle: number;
  private _creditLimitCents?: number;
  private _ownerId: string;

  constructor(data: CardAccountData) {
    super(data);
    const validated = CardAccount.schema.parse(data);
    this._name = validated.name.trim();
    this._issuer = validated.issuer.trim();
    this._last4 = validated.last4;
    this._billingCycle = validated.billingCycle;
    this._creditLimitCents = validated.creditLimitCents;
    this._ownerId = validated.ownerId;
  }

  get name(): string {
    return this._name;
  }

  get issuer(): string {
    return this._issuer;
  }

  get last4(): string {
    return this._last4;
  }

  get billingCycle(): number {
    return this._billingCycle;
  }

  get creditLimitCents(): number | undefined {
    return this._creditLimitCents;
  }

  get ownerId(): string {
    return this._ownerId;
  }

  canDelete(): boolean {
    // Placeholder - actual check in service layer (needs transaction repository)
    // Cannot delete CardAccount if it has transactions
    // TODO: implement actual check
    return true;
  }

  archive(): void {
    this.toggleActive();
  }

  override get toJSON() {
    return {
      ...super.toJSON,
      name: this._name,
      issuer: this._issuer,
      last4: this._last4,
      billingCycle: this._billingCycle,
      creditLimitCents: this._creditLimitCents,
      ownerId: this._ownerId,
    };
  }

  static parse(data: unknown): CardAccount {
    const validated = this.bodySchema.parse(data);
    return new CardAccount(validated);
  }

  static get schema() {
    return object({
      name: string().min(1).max(255).trim(),
      issuer: string().min(1).max(255).trim(),
      last4: z
        .string()
        .length(4)
        .regex(/^\d{4}$/, "Must be 4 digits"),
      billingCycle: number().int().min(1).max(31),
      creditLimitCents: number().int().positive().optional(),
      ownerId: uuid(),
    });
  }

  static readonly createSchema = this.schema;

  static override get bodySchema() {
    return super.bodySchema.extend(this.schema.shape);
  }
}
