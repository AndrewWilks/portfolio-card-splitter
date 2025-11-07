import { boolean, date, object, uuid, infer as zInfer } from "zod";

export interface EntityData {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Entity {
  private _id: string;
  private _isActive: boolean = true;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor({
    id,
    isActive,
    createdAt,
    updatedAt,
  }: {
    id?: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  } = {}) {
    const now = new Date();
    this._id = id || crypto.randomUUID();
    this._isActive = isActive !== undefined ? isActive : true;
    this._createdAt = createdAt || now;
    this._updatedAt = updatedAt || now;
  }

  get id(): string {
    return this._id;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  set updatedAt(date: Date) {
    this._updatedAt = date;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  toggleActive() {
    this._isActive = !this._isActive;
  }

  get toJSON() {
    return {
      id: this._id,
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  static get urlParamsSchema() {
    return object({
      id: uuid(),
    });
  }

  static get bodySchema() {
    return object({
      id: uuid(),
      isActive: boolean().default(true),
      createdAt: date(),
      updatedAt: date(),
    });
  }
}

export type EntityParamsType = zInfer<typeof Entity.urlParamsSchema>;
