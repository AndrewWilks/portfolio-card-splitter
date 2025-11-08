import { object, string, uuid } from "zod";
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

  constructor({
    id,
    createdAt,
    updatedAt,
    isActive,
    name,
    location,
    mergedIntoId,
  }: MerchantData) {
    super({ id, createdAt, updatedAt, isActive });
    this._name = name;
    this._location = location;
    this._mergedIntoId = mergedIntoId;
  }

  get name(): string {
    return this._name;
  }

  get location(): string | undefined {
    return this._location;
  }

  get mergedIntoId(): string | undefined {
    return this._mergedIntoId;
  }

  override get toJSON() {
    return {
      id: this.id,
      name: this._name,
      location: this._location,
      mergedIntoId: this._mergedIntoId,
      isActive: this.isActive,
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
    });
  }

  static override get bodySchema() {
    return super.bodySchema.extend(this.schema.shape);
  }
}
