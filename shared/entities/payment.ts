/**
 * Payment Entity
 *
 * Represents an actual payment from a Pot to a Transaction (CardAccount).
 * Payments reduce the outstanding balance on a CardAccount and are compared
 * against Reservations to detect budget mismatches.
 *
 * @module entities/payment
 */

import { Entity, EntityData } from "@shared/entities";
import { boolean, date, object, string, uuid } from "zod";
import { Cents, zCents } from "@shared/types";

/**
 * Payment Data Interface
 *
 * Records an actual payment from a Pot to cover (part of) a Transaction.
 * Payments affect the CardAccount's outstanding balance calculation.
 *
 * @interface PaymentData
 * @extends EntityData
 *
 * @property {Date} paidOn - Date when payment was made (important for statement reconciliation)
 * @property {string} potId - UUID of the Pot from which funds were paid (REQUIRED)
 * @property {string} transactionId - UUID of the Transaction being paid (REQUIRED)
 * @property {string} [reservationId] - UUID of the Reservation this payment fulfills (OPTIONAL)
 * @property {Cents} amountCents - Amount paid in cents (REQUIRED)
 * @property {string} [note] - Optional note about the payment
 * @property {boolean} needsReconciliation - Auto-calculated flag: true if payment doesn't match reservations
 * @property {string} createdById - UUID of the User who created this payment record
 *
 * @example
 * ```typescript
 * // Payment matching a reservation
 * const payment: PaymentData = {
 *   id: "payment-uuid",
 *   paidOn: new Date("2025-11-07"),
 *   potId: "groceries-pot-uuid",
 *   transactionId: "grocery-tx-uuid",
 *   reservationId: "reservation-uuid", // Links to reservation
 *   amountCents: 3000, // $30.00
 *   note: "Paid from grocery budget",
 *   needsReconciliation: false, // Matches reservation
 *   createdById: "user-uuid",
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * };
 *
 * // Payment without reservation (needs reconciliation)
 * const adhocPayment: PaymentData = {
 *   id: "payment-uuid",
 *   paidOn: new Date("2025-11-07"),
 *   potId: "cash-pot-uuid",
 *   transactionId: "tx-uuid",
 *   reservationId: undefined, // No reservation planned
 *   amountCents: 5000, // $50.00
 *   needsReconciliation: true, // Auto-flagged for reconciliation
 *   createdById: "user-uuid",
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * };
 * ```
 *
 * @remarks
 * Key relationships:
 * - One Payment belongs to one Pot (N:1) - source of funds
 * - One Payment belongs to one Transaction (N:1) - what's being paid
 * - One Payment optionally belongs to one Reservation (N:1) - planned payment
 * - Multiple Payments can pay one Transaction (partial payments from different Pots)
 *
 * Outstanding balance calculation:
 * - CardAccount outstanding = Sum(Transaction.amountCents) - Sum(Payment.amountCents)
 * - Calculated per CardAccount via LedgerService
 * - Payments reduce the balance owed on the credit card
 *
 * Reconciliation logic (auto-calculated in PaymentService):
 * - needsReconciliation = true if:
 *   * Payment.amountCents ≠ sum of Reservations for same transaction
 *   * Payment exists without Reservations
 *   * Reservations exist without Payment
 * - Purpose: Detect when actual spending differs from budget plan
 *
 * Business rules (enforced in PaymentService):
 * - Cannot pay more than Transaction.amountCents total (across all payments)
 * - Cannot pay more than Pot.availableCents
 * - paidOn date important for statement matching
 * - Pot must exist and be active
 * - Transaction must exist
 *
 * @see {@link Pot} - Source of funds for payment
 * @see {@link Transaction} - What's being paid
 * @see {@link Reservation} - Planned payment (optional)
 * @see {@link CardAccount} - Payment reduces outstanding balance
 */
export interface PaymentData extends EntityData {
  paidOn: Date;
  potId: string;
  transactionId: string;
  reservationId?: string;
  amountCents: Cents;
  note?: string;
  needsReconciliation: boolean;
  createdById: string;
}

/**
 * Payment Entity Class
 *
 * Immutable entity representing an actual payment from Pot to Transaction.
 * Central to outstanding balance tracking and budget reconciliation.
 *
 * @class Payment
 * @extends Entity
 *
 * @remarks
 * Workflow:
 * 1. Transaction created with Allocations (who owes what)
 * 2. Reservations created (which Pots will pay)
 * 3. Payments created (actual payment from Pots)
 * 4. If Payment ≠ Reservations, needsReconciliation flagged
 * 5. Outstanding balance updated: CardAccount balance - Payments
 *
 * The `needsReconciliation` flag helps users identify:
 * - Unplanned spending (payment without reservation)
 * - Budget variance (payment amount differs from reservation)
 * - Missing payments (reservation without payment)
 *
 * @example
 * ```typescript
 * const payment = new Payment({
 *   id: "payment-uuid",
 *   paidOn: new Date("2025-11-07"),
 *   potId: "groceries-pot-uuid",
 *   transactionId: "tx-uuid",
 *   reservationId: "res-uuid",
 *   amountCents: 2500, // $25.00
 *   note: "Weekly grocery payment",
 *   needsReconciliation: false,
 *   createdById: "user-uuid",
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * });
 *
 * console.log(payment.paidOn); // Date
 * console.log(payment.needsReconciliation); // false
 * ```
 */
export class Payment extends Entity {
  private _paidOn: Date;
  private _potId: string;
  private _transactionId: string;
  private _reservationId?: string;
  private _amountCents: Cents;
  private _note?: string;
  private _needsReconciliation: boolean;
  private _createdById: string;

  constructor({
    id,
    createdAt,
    updatedAt,
    paidOn,
    potId,
    transactionId,
    reservationId,
    amountCents,
    note,
    needsReconciliation,
    createdById,
  }: PaymentData) {
    super({ id, createdAt, updatedAt });
    this._paidOn = paidOn;
    this._potId = potId;
    this._transactionId = transactionId;
    this._reservationId = reservationId;
    this._amountCents = amountCents;
    this._note = note;
    this._needsReconciliation = needsReconciliation;
    this._createdById = createdById;
  }

  get paidOn(): Date {
    return this._paidOn;
  }

  get potId(): string {
    return this._potId;
  }

  get transactionId(): string {
    return this._transactionId;
  }

  get reservationId(): string | undefined {
    return this._reservationId;
  }

  get amountCents(): Cents {
    return this._amountCents;
  }

  get note(): string | undefined {
    return this._note;
  }

  get needsReconciliation(): boolean {
    return this._needsReconciliation;
  }

  get createdById(): string {
    return this._createdById;
  }

  override get toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      paidOn: this._paidOn,
      potId: this._potId,
      transactionId: this._transactionId,
      reservationId: this._reservationId,
      amountCents: this._amountCents,
      note: this._note,
      needsReconciliation: this._needsReconciliation,
      createdById: this._createdById,
      isActive: this.isActive,
    };
  }

  static parse(data: unknown): Payment {
    const parsed = this.schema.parse(data) as PaymentData;
    return new Payment(parsed);
  }

  static get schema() {
    return object({
      paidOn: date(),
      potId: uuid(),
      transactionId: uuid(),
      reservationId: uuid().optional(),
      amountCents: zCents.min(0),
      note: string().optional(),
      needsReconciliation: boolean(),
      createdById: uuid(),
    });
  }

  // Schema for creating payments (used in service layer)
  // Note: needsReconciliation is calculated by the service, not provided by caller
  static get createSchema() {
    return object({
      potId: uuid(),
      transactionId: uuid(),
      amountCents: zCents.positive(),
      paidOn: date(),
      reservationId: uuid().optional(),
      note: string().optional(),
      createdById: uuid(),
    });
  }

  static override get bodySchema() {
    return super.bodySchema.extend(this.schema.shape);
  }
}
