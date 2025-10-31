// For pots table. Includes balance tracking, ACLs, and available balance calculations.
import { number, object, record, string, uuid, enum as zEnum } from "zod";
import { Entity, EntityData } from "./base/entity.ts";
import { Cents, zCents } from "@shared/types";
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
  availableCents?: Cents; // e.g., calculated from transactions
  reservedCents?: Cents; // e.g., pending transactions
  visibilityAcls?: Map<UUID, PotVisibility>; // access control list
}

// TODO: Derived fields should not be persisted, fields like availableCents or reservedCents on Pot should be returned by services as derived values, not stored on the entity data, they will drift.
export class Pot extends Entity {
  private _name: string;
  private _balanceCents: number;
  private _scope: PotScope;
  private _ownerId: string;
  private _accountType: PotType;
  private _institution?: string;
  private _maskingAccount?: string;
  private _physicalLocation?: string;
  private _availableCents?: Cents;
  private _reservedCents?: Cents;
  private _visibilityAcls?: Map<UUID, PotVisibility>;

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
    availableCents,
    reservedCents,
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
    this._availableCents = availableCents;
    this._reservedCents = reservedCents;
    this._visibilityAcls = visibilityAcls;
  }

  get toJSON() {
    return {
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
      availableCents: this._availableCents,
      reservedCents: this._reservedCents,
      visibilityAcls: this._visibilityAcls,
    };
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
      availableCents: zCents.optional(),
      reservedCents: zCents.optional(),
      visibilityAcls: record(string(), zEnum(PotVisibility)).optional(),
    });
  }

  static override get bodySchema() {
    return super.bodySchema.extend(this.schema.shape);
  }
}
