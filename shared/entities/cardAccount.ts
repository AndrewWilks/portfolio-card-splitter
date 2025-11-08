import { number, object, string, uuid, z } from "zod";
import { Entity, type EntityData } from "./base/entity.ts";

/**
 * CardAccount Data Interface
 * 
 * Represents a credit card account (e.g., Chase Sapphire, Amex Gold).
 * Every Transaction must belong to exactly one CardAccount.
 * 
 * @interface CardAccountData
 * @extends EntityData
 * 
 * @property {string} name - User-friendly name for the account (e.g., "Chase Sapphire")
 * @property {string} issuer - Card issuer/bank name (e.g., "Chase", "American Express")
 * @property {string} last4 - Last 4 digits of the account number for identification
 * @property {number} billingCycle - Day of month when statement closes (1-31)
 * @property {number} [creditLimitCents] - Optional credit limit in cents (e.g., 500000 = $5,000)
 * @property {string} ownerId - UUID of the User who owns this account
 * @property {boolean} isActive - Soft delete flag; false = archived
 * 
 * @example
 * ```typescript
 * const accountData: CardAccountData = {
 *   id: "uuid",
 *   name: "Chase Sapphire Reserve",
 *   issuer: "Chase",
 *   last4: "1234",
 *   billingCycle: 15, // Statement closes on 15th of each month
 *   creditLimitCents: 1000000, // $10,000 limit
 *   ownerId: "user-uuid",
 *   isActive: true,
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * };
 * ```
 * 
 * @remarks
 * - Outstanding balance is calculated via LedgerService: Sum(Transactions) - Sum(Payments)
 * - Cannot be deleted if Transactions exist; set isActive=false to archive
 * - If only one CardAccount exists, UI should auto-select it for new Transactions
 * 
 * @see {@link Transaction} - Every Transaction must reference a CardAccount
 * @see {@link Card} - Optional Cards can belong to a CardAccount for attribution
 * @see {@link Payment} - Payments reduce the outstanding balance of a CardAccount
 */
export interface CardAccountData extends EntityData {
  name: string;
  issuer: string;
  last4: string;
  billingCycle: number;
  creditLimitCents?: number;
  ownerId: string;
  isActive: boolean;
}

/**
 * CardAccount Entity
 * 
 * Represents a credit card account with validation and business rules.
 * Central entity in the transaction tracking system - all expenses flow through CardAccounts.
 * 
 * @class CardAccount
 * @extends Entity
 * 
 * @remarks
 * Key relationships:
 * - One CardAccount has many Transactions (1:N)
 * - One CardAccount has many Cards (1:N) - optional for attribution
 * - One User owns many CardAccounts (1:N)
 * - Payments are linked to Transactions, which roll up to CardAccount balance
 * 
 * Business rules:
 * - `name` and `issuer` are trimmed on construction
 * - `billingCycle` must be 1-31 (validated in schema)
 * - `last4` must be exactly 4 digits (validated in schema)
 * - Outstanding balance calculated dynamically, not stored
 * 
 * @example
 * ```typescript
 * const account = new CardAccount({
 *   id: "uuid",
 *   name: "  Chase Sapphire  ", // Will be trimmed
 *   issuer: "Chase",
 *   last4: "1234",
 *   billingCycle: 15,
 *   creditLimitCents: 500000,
 *   ownerId: "user-uuid",
 *   isActive: true,
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * });
 * 
 * console.log(account.name); // "Chase Sapphire" (trimmed)
 * console.log(account.toJSON()); // Full serialized data
 * ```
 */
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
