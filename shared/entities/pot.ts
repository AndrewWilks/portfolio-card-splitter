// For pots table. Includes balance tracking, ACLs, and available balance calculations.
import { number, object, record, string, uuid, enum as zEnum } from "zod";
import { Entity, EntityData } from "./base/entity.ts";
import { Cents } from "@shared/types";
import { UUID } from "node:crypto";

enum PotScope {
  SOLO = "solo",
  SHARED = "shared",
}

enum PotType {
  SAVINGS = "savings",
  LOAN = "loan",
  CASH = "cash",
  OTHER = "other",
}

enum PotVisibility {
  READ = "read",
  MANAGE = "manage",
}

export interface PotData extends EntityData {
  name: string; // pot name
  balanceCents: number; // total balance
  scope: PotScope; // e.g., "solo", "shared"
  ownerId: string; // user ID
  accountType: PotType; // e.g., "savings", "loan", "cash"
  institution?: string; // e.g., "Chase", "Cash"
  maskingAccount?: string; // e.g., last 4 digits, "****1234"
  physicalLocation?: string; // e.g., "Wallet", "Home Safe"
  visibilityAcls?: Map<UUID, PotVisibility>; // access control list
}

export class Pot extends Entity {
  private _name: string;
  private _balanceCents: number;
  private _scope: PotScope;
  private _ownerId: string;
  private _accountType: PotType;
  private _institution?: string;
  private _maskingAccount?: string;
  private _physicalLocation?: string;
  private _visibilityAcls?: Map<UUID, PotVisibility>;

  // Transient derived values (not persisted)
  private _cachedReservedCents?: Cents;
  private _cachedAvailableCents?: Cents;

  constructor({
    id,
    createdAt,
    updatedAt,
    name,
    balanceCents,
    scope,
    ownerId,
    accountType,
    institution,
    maskingAccount,
    physicalLocation,
    visibilityAcls,
  }: PotData) {
    super({ id, createdAt, updatedAt });
    this._name = name;
    this._balanceCents = balanceCents;
    this._scope = scope;
    this._ownerId = ownerId;
    this._accountType = accountType;
    this._institution = institution;
    this._maskingAccount = maskingAccount;
    this._physicalLocation = physicalLocation;
    this._visibilityAcls = visibilityAcls;
  }

  /**
   * Set the derived values for this pot instance. Services should call this
   * after fetching reservation data to enable getters and toJSON enrichment.
   * @param reservationAmounts - Array of amounts currently reserved
   */
  withDerivedValues(reservationAmounts: Cents[]): this {
    this._cachedReservedCents = this.calculateReservedCents(reservationAmounts);
    this._cachedAvailableCents = this.calculateAvailableCents(
      this._cachedReservedCents
    );
    return this;
  }

  /**
   * Calculate the reserved balance from a list of reservation amounts.
   * @param reservationAmounts - Array of amounts currently reserved
   * @returns The total reserved amount in cents
   */
  private calculateReservedCents(reservationAmounts: Cents[]): Cents {
    return reservationAmounts.reduce((sum, amount) => sum + amount, 0) as Cents;
  }

  /**
   * Calculate the available balance by subtracting reserved amounts from the total balance.
   * @param reservedCents - The total amount currently reserved (e.g., from pending transactions)
   * @returns The available balance in cents
   */
  private calculateAvailableCents(reservedCents: Cents): Cents {
    return (this._balanceCents - reservedCents) as Cents;
  }

  /**
   * Get the reserved cents (if derived values have been set via withDerivedValues)
   */
  get reservedCents(): Cents | undefined {
    return this._cachedReservedCents;
  }

  /**
   * Get the available cents (if derived values have been set via withDerivedValues)
   */
  get availableCents(): Cents | undefined {
    return this._cachedAvailableCents;
  }

  get balanceCents(): number {
    return this._balanceCents;
  }

  get name(): string {
    return this._name;
  }

  get ownerId(): string {
    return this._ownerId;
  }

  override get toJSON() {
    const base = {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      name: this._name,
      balanceCents: this._balanceCents,
      scope: this._scope,
      ownerId: this._ownerId,
      accountType: this._accountType,
      institution: this._institution,
      maskingAccount: this._maskingAccount,
      physicalLocation: this._physicalLocation,
      visibilityAcls: this._visibilityAcls,
      isActive: this.isActive,
    };

    // Include derived values if they have been set
    if (this._cachedReservedCents !== undefined) {
      return {
        ...base,
        reservedCents: this._cachedReservedCents,
        availableCents: this._cachedAvailableCents,
      };
    }

    return base;
  }

  static parse(data: unknown): Pot {
    const parsed = this.schema.parse(data) as PotData;
    return new Pot(parsed);
  }

  static get schema() {
    return object({
      name: string().min(1).max(100),
      balanceCents: number().int(),
      scope: zEnum(PotScope),
      ownerId: uuid(),
      accountType: zEnum(PotType),
      institution: string().max(100).optional(),
      maskingAccount: string().max(20).optional(),
      physicalLocation: string().max(100).optional(),
      visibilityAcls: record(string(), zEnum(PotVisibility)).optional(),
    });
  }

  static override get bodySchema() {
    return super.bodySchema.extend(this.schema.shape);
  }
}
