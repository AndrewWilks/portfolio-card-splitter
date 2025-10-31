import { date, object, uuid, infer as zInfer } from "zod";

export interface EntityData {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Entity {
  private _id: string;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor({
    id,
    createdAt,
    updatedAt,
  }: { id?: string; createdAt?: Date; updatedAt?: Date } = {}) {
    const now = new Date();
    this._id = id || crypto.randomUUID();
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

  static get urlParamsSchema() {
    return object({
      id: uuid(),
    });
  }

  static get bodySchema() {
    return object({
      id: uuid(),
      createdAt: date(),
      updatedAt: date(),
    });
  }
}

export type EntityParamsType = zInfer<typeof Entity.urlParamsSchema>;
