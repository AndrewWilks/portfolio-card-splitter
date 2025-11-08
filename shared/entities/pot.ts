/**
 * Pot Entity
 * 
 * Represents a monetary "pot" or "envelope" for budgeting and expense tracking.
 * Pots hold funds that can be reserved (via Reservations) and spent (via Payments).
 * Supports both SOLO (private) and SHARED (multi-user) pots with ACL enforcement.
 * 
 * @module entities/pot
 */

import { number, object, record, string, uuid, enum as zEnum } from "zod";
import { Entity, EntityData } from "./base/entity.ts";
import { Cents } from "@shared/types";
import { UUID } from "node:crypto";

/**
 * Pot Scope Enum
 * 
 * Defines pot visibility and access control level.
 * 
 * @enum {string}
 * @property {string} SOLO - Private pot, only owner can access (strict privacy)
 * @property {string} SHARED - Multi-user pot with ACL-based access control
 */
export enum PotScope {
  SOLO = "solo",
  SHARED = "shared",
}

/**
 * Pot Type Enum
 * 
 * Categorizes the type of account/pot for organization.
 * 
 * @enum {string}
 * @property {string} SAVINGS - Savings account at a financial institution
 * @property {string} LOAN - Loan account (amount owed)
 * @property {string} CASH - Physical cash or cash-equivalent
 * @property {string} OTHER - Other type of pot
 */
export enum PotType {
  SAVINGS = "savings",
  LOAN = "loan",
  CASH = "cash",
  OTHER = "other",
}

/**
 * Pot Visibility Enum
 * 
 * Defines access levels for SHARED pots (ignored for SOLO pots).
 * 
 * @enum {string}
 * @property {string} READ - User can view pot balance and transactions
 * @property {string} MANAGE - User can view and modify pot (create reservations/payments)
 */
export enum PotVisibility {
  READ = "read",
  MANAGE = "manage",
}

/**
 * Pot Data Interface
 * 
 * Represents a budgeting "pot" or "envelope" containing funds.
 * Pots are the SOURCE of funds for Payments and Reservations.
 * 
 * @interface PotData
 * @extends EntityData
 * 
 * @property {string} name - User-friendly name (e.g., "Groceries", "Emergency Fund")
 * @property {number} balanceCents - Total balance in cents (can be negative for loans)
 * @property {PotScope} scope - "solo" (private) or "shared" (multi-user with ACL)
 * @property {string} ownerId - UUID of the User who owns this pot (full access)
 * @property {PotType} accountType - Type: "savings", "loan", "cash", "other"
 * @property {string} [institution] - Financial institution name (e.g., "Chase", "Ally Bank")
 * @property {string} [maskingAccount] - Last 4 digits or identifier (e.g., "****1234")
 * @property {string} [physicalLocation] - Where physical cash is kept (e.g., "Wallet", "Home Safe")
 * @property {Map<UUID, PotVisibility>} [visibilityAcls] - Access control list for SHARED pots
 * 
 * @example
 * ```typescript
 * // SOLO pot (private)
 * const soloPot: PotData = {
 *   id: "pot-uuid",
 *   name: "Personal Savings",
 *   balanceCents: 100000, // $1,000.00
 *   scope: PotScope.SOLO,
 *   ownerId: "user-uuid",
 *   accountType: PotType.SAVINGS,
 *   institution: "Ally Bank",
 *   maskingAccount: "****1234",
 *   // visibilityAcls not used for SOLO
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * };
 * 
 * // SHARED pot with ACL
 * const sharedPot: PotData = {
 *   id: "pot-uuid",
 *   name: "Household Groceries",
 *   balanceCents: 50000, // $500.00
 *   scope: PotScope.SHARED,
 *   ownerId: "alice-uuid", // Owner has full access
 *   accountType: PotType.CASH,
 *   visibilityAcls: new Map([
 *     ["bob-uuid", PotVisibility.MANAGE],   // Bob can view and modify
 *     ["carol-uuid", PotVisibility.READ]    // Carol can only view
 *   ]),
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * };
 * ```
 * 
 * @remarks
 * Key relationships:
 * - One Pot belongs to one User (owner) (N:1)
 * - One Pot has many Reservations (1:N) - funds earmarked for future payments
 * - One Pot has many Payments (1:N) - actual payments made from this pot
 * - SHARED Pots have ACL entries for other Users
 * 
 * Derived values (NOT persisted, calculated on-demand):
 * - `reservedCents` = Sum of all active Reservations for this Pot
 * - `availableCents` = `balanceCents` - `reservedCents`
 * - These are cached in memory but recalculated when needed
 * 
 * Access control (enforced in PotService):
 * - SOLO pots: Only owner can access (strict privacy)
 * - SHARED pots: Owner + users in visibilityAcls can access based on level
 *   * READ: Can view balance, reservations, payments
 *   * MANAGE: Can view AND create/modify reservations, payments
 * - Owner always has MANAGE level implicitly
 * 
 * Business rules:
 * - Cannot create Reservation if amount > availableCents
 * - Cannot create Payment if amount > availableCents
 * - Balance can go negative (allowed for tracking loans/debt)
 * - ACL only relevant for SHARED pots
 * 
 * @see {@link Reservation} - Funds reserved from this pot
 * @see {@link Payment} - Payments made from this pot
 * @see {@link User} - Pot owner and ACL users
 */
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

/**
 * Pot Entity Class
 * 
 * Immutable entity representing a budgeting pot/envelope.
 * Implements "envelope budgeting" pattern with derived balance calculations.
 * 
 * @class Pot
 * @extends Entity
 * 
 * @remarks
 * Pot lifecycle:
 * 1. User creates Pot with initial balance
 * 2. User creates Reservations to earmark funds for transactions
 *    - Reservations reduce availableCents (but not balanceCents)
 * 3. User creates Payments to actually spend funds
 *    - Payments reduce balanceCents
 * 4. Derived values updated: availableCents = balanceCents - reservedCents
 * 
 * Privacy model:
 * - SOLO pots: Completely private, only owner sees them
 * - SHARED pots: Owner + ACL users can access
 * - Other users cannot even see that SOLO pots exist
 * 
 * @example
 * ```typescript
 * const pot = new Pot({
 *   id: "pot-uuid",
 *   name: "Emergency Fund",
 *   balanceCents: 500000, // $5,000.00
 *   scope: PotScope.SOLO,
 *   ownerId: "user-uuid",
 *   accountType: PotType.SAVINGS,
 *   institution: "Ally Bank",
 *   maskingAccount: "****5678",
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * });
 * 
 * console.log(pot.name); // "Emergency Fund"
 * console.log(pot.scope); // PotScope.SOLO
 * // Derived values calculated via service layer
 * ```
 */
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
