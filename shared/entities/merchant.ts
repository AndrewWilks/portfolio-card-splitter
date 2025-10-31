import { boolean, object, string, uuid } from "zod";
import { Entity, EntityData } from "@shared/entities";

// For merchants table. Includes normalization logic for fuzzy matching.
interface MerchantData extends EntityData {
  name: string;
  location?: string;
  mergedIntoId?: string;
  isActive: boolean;
}

export class Merchant extends Entity {
  private _name: string;
  private _location?: string;
  private _mergedIntoId?: string;
  private _isActive: boolean;

  constructor({
    id,
    createdAt,
    updatedAt,
    isActive,
    name,
    location,
    mergedIntoId,
  }: MerchantData) {
    super({ id, createdAt, updatedAt });
    this._isActive = isActive;
    this._name = name;
    this._location = location;
    this._mergedIntoId = mergedIntoId;
  }

  get toJSON() {
    return {
      id: this.id,
      name: this._name,
      location: this._location,
      mergedIntoId: this._mergedIntoId,
      isActive: this._isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static parse(data: unknown): Merchant {
    const parsed = this.schema.parse(data) as MerchantData;
    return new Merchant(parsed);
  }

  static get schema() {
    return object({
      name: string().min(1).max(255),
      location: string().max(255).optional(),
      mergedIntoId: uuid().optional(),
      isActive: boolean().default(true),
    });
  }

  static override get bodySchema() {
    return super.bodySchema.extend(this.schema.shape);
  }
}
