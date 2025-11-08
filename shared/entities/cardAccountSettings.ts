import { boolean, number, object, uuid } from "zod";
import { Entity, type EntityData } from "./base/entity.ts";

export interface CardAccountSettingsData extends EntityData {
  cardAccountId: string;
  statementCloseDayOfMonth: number;
  statementFrequencyDays: number;
  paymentDueDaysAfterClose: number;
  interestFreeDays: number;
  hasInterestFreePeriod: boolean;
  minimumPaymentPercentage: number;
  minimumPaymentFloorCents: number;
  reminderDaysBeforeDue: number;
  isActive: boolean;
}

export const DEFAULT_AUSTRALIAN_SETTINGS = {
  statementCloseDayOfMonth: 15,
  statementFrequencyDays: 30,
  paymentDueDaysAfterClose: 21,
  interestFreeDays: 55,
  hasInterestFreePeriod: true,
  minimumPaymentPercentage: 2,
  minimumPaymentFloorCents: 2500,
  reminderDaysBeforeDue: 3,
  isActive: true,
};

export const PRESETS = {
  COMMBANK: DEFAULT_AUSTRALIAN_SETTINGS,
  ANZ: { ...DEFAULT_AUSTRALIAN_SETTINGS, statementCloseDayOfMonth: 10 },
  WESTPAC: { ...DEFAULT_AUSTRALIAN_SETTINGS, interestFreeDays: 44 },
  NAB: { ...DEFAULT_AUSTRALIAN_SETTINGS, paymentDueDaysAfterClose: 25 },
};

export class CardAccountSettings extends Entity {
  private _cardAccountId: string;
  private _statementCloseDayOfMonth: number;
  private _statementFrequencyDays: number;
  private _paymentDueDaysAfterClose: number;
  private _interestFreeDays: number;
  private _hasInterestFreePeriod: boolean;
  private _minimumPaymentPercentage: number;
  private _minimumPaymentFloorCents: number;
  private _reminderDaysBeforeDue: number;

  constructor(data: CardAccountSettingsData) {
    super(data);
    const validated = CardAccountSettings.schema.parse(data);
    this._cardAccountId = validated.cardAccountId;
    this._statementCloseDayOfMonth = validated.statementCloseDayOfMonth;
    this._statementFrequencyDays = validated.statementFrequencyDays;
    this._paymentDueDaysAfterClose = validated.paymentDueDaysAfterClose;
    this._interestFreeDays = validated.interestFreeDays;
    this._hasInterestFreePeriod = validated.hasInterestFreePeriod;
    this._minimumPaymentPercentage = validated.minimumPaymentPercentage;
    this._minimumPaymentFloorCents = validated.minimumPaymentFloorCents;
    this._reminderDaysBeforeDue = validated.reminderDaysBeforeDue;
  }

  get cardAccountId(): string {
    return this._cardAccountId;
  }

  get statementCloseDayOfMonth(): number {
    return this._statementCloseDayOfMonth;
  }

  get statementFrequencyDays(): number {
    return this._statementFrequencyDays;
  }

  get paymentDueDaysAfterClose(): number {
    return this._paymentDueDaysAfterClose;
  }

  get interestFreeDays(): number {
    return this._interestFreeDays;
  }

  get hasInterestFreePeriod(): boolean {
    return this._hasInterestFreePeriod;
  }

  get minimumPaymentPercentage(): number {
    return this._minimumPaymentPercentage;
  }

  get minimumPaymentFloorCents(): number {
    return this._minimumPaymentFloorCents;
  }

  get reminderDaysBeforeDue(): number {
    return this._reminderDaysBeforeDue;
  }

  calculateDueDate(statementCloseDate: Date): Date {
    const dueDate = new Date(statementCloseDate);
    dueDate.setDate(dueDate.getDate() + this._paymentDueDaysAfterClose);
    return dueDate;
  }

  calculateStatementCloseDate(year: number, month: number): Date {
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const closeDay = Math.min(this._statementCloseDayOfMonth, lastDayOfMonth);
    return new Date(year, month, closeDay, 23, 59, 59);
  }

  isInInterestFreePeriod(transactionDate: Date, paymentDate: Date): boolean {
    if (!this._hasInterestFreePeriod) return false;
    const daysDiff = Math.floor(
      (paymentDate.getTime() - transactionDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return daysDiff <= this._interestFreeDays;
  }

  calculateMinimumPaymentCents(balanceCents: number): number {
    const percentageAmount = Math.ceil(
      balanceCents * (this._minimumPaymentPercentage / 100)
    );
    return Math.max(percentageAmount, this._minimumPaymentFloorCents);
  }

  getNextStatementCloseDate(fromDate: Date): Date {
    const nextClose = new Date(fromDate);
    nextClose.setDate(nextClose.getDate() + this._statementFrequencyDays);
    return this.calculateStatementCloseDate(
      nextClose.getFullYear(),
      nextClose.getMonth()
    );
  }

  archive(): void {
    this.toggleActive();
  }

  override get toJSON() {
    return {
      ...super.toJSON,
      cardAccountId: this._cardAccountId,
      statementCloseDayOfMonth: this._statementCloseDayOfMonth,
      statementFrequencyDays: this._statementFrequencyDays,
      paymentDueDaysAfterClose: this._paymentDueDaysAfterClose,
      interestFreeDays: this._interestFreeDays,
      hasInterestFreePeriod: this._hasInterestFreePeriod,
      minimumPaymentPercentage: this._minimumPaymentPercentage,
      minimumPaymentFloorCents: this._minimumPaymentFloorCents,
      reminderDaysBeforeDue: this._reminderDaysBeforeDue,
    };
  }

  static parse(data: unknown): CardAccountSettings {
    const validated = this.bodySchema.parse(data);
    return new CardAccountSettings(validated);
  }

  static get schema() {
    return object({
      cardAccountId: uuid(),
      statementCloseDayOfMonth: number().int().min(1).max(31),
      statementFrequencyDays: number().int().positive(),
      paymentDueDaysAfterClose: number().int().positive(),
      interestFreeDays: number().int().positive(),
      hasInterestFreePeriod: boolean(),
      minimumPaymentPercentage: number().min(0.01).max(100),
      minimumPaymentFloorCents: number().int().positive(),
      reminderDaysBeforeDue: number().int().nonnegative(),
    });
  }

  static readonly createSchema = this.schema.partial({
    statementCloseDayOfMonth: true,
    statementFrequencyDays: true,
    paymentDueDaysAfterClose: true,
    interestFreeDays: true,
    hasInterestFreePeriod: true,
    minimumPaymentPercentage: true,
    minimumPaymentFloorCents: true,
    reminderDaysBeforeDue: true,
  });

  static override get bodySchema() {
    return super.bodySchema.extend(this.schema.shape);
  }
}
