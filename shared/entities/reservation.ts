/**
 * Reservation Entity
 *
 * Represents funds reserved from a Pot to cover a Member's share of a Transaction.
 * Links Pots → Allocations → Transactions, enabling the "envelope budgeting" workflow.
 *
 * @module entities/reservation
 */

import { object, uuid } from "zod";
import { Entity, EntityData } from "./base/entity.ts";
import { Cents, zCents } from "@shared/types";

/**
 * Reservation Data Interface
 *
 * Links a Pot to a Member's Allocation, reserving funds without creating a Payment yet.
 * Each Member's allocation can have multiple reservations from different Pots.
 *
 * @interface ReservationData
 * @extends EntityData
 *
 * @property {string} potId - UUID of the Pot from which funds are reserved
 * @property {string} transactionId - UUID of the Transaction this reservation applies to
 * @property {string} [allocationId] - UUID of the Allocation this reservation covers (nullable for legacy data)
 * @property {string} memberId - UUID of the Member whose share is being reserved (denormalized for queries)
 * @property {Cents} amountCents - Amount reserved in cents
 * @property {string} createdById - UUID of the User who created this reservation
 *
 * @example
 * ```typescript
 * // Reserve $30 from "Groceries" pot for Alice's share of a transaction
 * const reservation: ReservationData = {
 *   id: "reservation-uuid",
 *   potId: "groceries-pot-uuid",
 *   transactionId: "grocery-tx-uuid",
 *   allocationId: "alice-allocation-uuid",
 *   memberId: "alice-uuid", // Denormalized from allocation
 *   amountCents: 3000, // $30.00
 *   createdById: "user-uuid",
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * };
 * ```
 *
 * @remarks
 * Key relationships:
 * - One Reservation belongs to one Pot (N:1)
 * - One Reservation belongs to one Transaction (N:1)
 * - One Reservation belongs to one Allocation (N:1) - optional for legacy
 * - One Reservation belongs to one Member (N:1) - denormalized
 * - One Reservation may have one Payment (1:1) - when funds are actually paid
 *
 * Workflow:
 * 1. User creates Transaction with Allocations (splits)
 * 2. User creates Reservations to "earmark" funds from Pots for each Member's share
 * 3. Later, user creates Payments to actually pay the Transaction
 * 4. If Payment.amountCents ≠ sum of Reservations, Payment.needsReconciliation = true
 *
 * Business rules (enforced in ReservationService):
 * - Cannot reserve more than Pot.availableCents (balance - existing reservations)
 * - Cannot reserve more than Allocation.amountCents for the same member
 * - Multiple Reservations can cover one Allocation (e.g., $20 from "Groceries" + $10 from "Dining")
 * - Reservation.memberId must match Allocation.memberId
 * - Sum of Reservations for an Allocation should not exceed Allocation.amountCents
 *
 * @see {@link Pot} - Source of funds
 * @see {@link Allocation} - Member's share of Transaction being reserved
 * @see {@link Transaction} - Parent transaction
 * @see {@link Payment} - Actual payment that may reference this Reservation
 * @see {@link Member} - Who this reservation is for
 */
interface ReservationData extends EntityData {
  potId: string; // linked pot ID
  transactionId: string; // linked transaction ID
  allocationId?: string; // linked allocation ID (nullable)
  memberId: string; // linked member ID (required)
  amountCents: Cents; // reserved amount
  createdById: string; // user who created the reservation
}

/**
 * Reservation Entity Class
 *
 * Immutable entity representing a fund reservation from a Pot.
 * Enables "envelope budgeting" by earmarking funds before payment.
 *
 * @class Reservation
 * @extends Entity
 *
 * @remarks
 * Reservations are the bridge between budgeting (Pots) and spending (Transactions).
 * They allow users to:
 * - See what funds are "spoken for" vs available
 * - Track which Pots will pay for which transactions
 * - Detect mismatches between planned (reservations) and actual (payments)
 *
 * The `needsReconciliation` flag on Payment is set when:
 * - Payment amount doesn't match sum of Reservations
 * - Payment exists without corresponding Reservations
 * - Reservations exist without corresponding Payment
 *
 * @example
 * ```typescript
 * const reservation = new Reservation({
 *   id: "reservation-uuid",
 *   potId: "groceries-pot-uuid",
 *   transactionId: "tx-uuid",
 *   allocationId: "alice-allocation-uuid",
 *   memberId: "alice-uuid",
 *   amountCents: 2500, // $25.00
 *   createdById: "user-uuid",
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * });
 *
 * console.log(reservation.amountCents); // 2500
 * console.log(reservation.allocationId); // "alice-allocation-uuid"
 * ```
 */
export class Reservation extends Entity {
  private _potId: string;
  private _transactionId: string;
  private _allocationId?: string;
  private _memberId: string;
  private _amountCents: Cents;
  private _createdById: string;

  constructor({
    id,
    createdAt,
    updatedAt,
    potId,
    transactionId,
    allocationId,
    memberId,
    amountCents,
    createdById,
  }: ReservationData) {
    super({ id, createdAt, updatedAt });
    this._potId = potId;
    this._transactionId = transactionId;
    this._allocationId = allocationId;
    this._memberId = memberId;
    this._amountCents = amountCents;
    this._createdById = createdById;
  }

  get potId(): string {
    return this._potId;
  }

  get transactionId(): string {
    return this._transactionId;
  }

  get allocationId(): string | undefined {
    return this._allocationId;
  }

  get memberId(): string {
    return this._memberId;
  }

  get amountCents(): Cents {
    return this._amountCents;
  }

  get createdById(): string {
    return this._createdById;
  }

  override get toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      potId: this._potId,
      transactionId: this._transactionId,
      allocationId: this._allocationId,
      memberId: this._memberId,
      amountCents: this._amountCents,
      createdById: this._createdById,
      isActive: this.isActive,
    };
  }

  static create(data: ReservationData): Reservation {
    const validated = this.schema.parse(data);
    return new Reservation(validated);
  }

  static parse(data: unknown): Reservation {
    const parsed = this.schema.parse(data) as ReservationData;
    return new Reservation(parsed);
  }

  static get schema() {
    return object({
      potId: uuid(),
      transactionId: uuid(),
      allocationId: uuid().optional(),
      memberId: uuid(),
      amountCents: zCents.min(0),
      createdById: uuid(),
    });
  }

  // Schema for creating reservations (used in service layer)
  static get createSchema() {
    return object({
      potId: uuid(),
      transactionId: uuid(),
      memberId: uuid(),
      amountCents: zCents.positive(),
      allocationId: uuid().optional(),
      createdById: uuid(),
    });
  }

  static override get bodySchema() {
    return super.bodySchema.extend(this.schema.shape);
  }
}
