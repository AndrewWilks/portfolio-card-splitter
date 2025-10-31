import { json, object, uuid, enum as zEnum } from "zod";
import { Entity, EntityData } from "@shared/entities";

// For events table. Audit trail with payloads.
enum EventType {
  CREATED = "created",
  UPDATED = "updated",
  DELETED = "deleted",
  ARCHIVED = "archived",
}

enum EntityType {
  TRANSACTION = "transaction",
  PAYMENT = "payment",
  POT = "pot",
  MEMBER = "member",
  MERCHANT = "merchant",
  TAG = "tag",
  ALLOCATION = "allocation",
  TRANSFER = "transfer",
  RESERVATION = "reservation",
}

/* TODO: Event payload typing, define a discriminated union keyed by type, so payloads are typed per event, for example,

  type AppEvent =
  | { type: "transaction.created", actorUserId: Uuid, payload: { transactionId: Uuid } }
  | { type: "merchant.merged", actorUserId: Uuid, payload: { fromId: Uuid, toId: Uuid } };
  ... etc.

 */

export interface EventData<T> extends EntityData {
  type: EventType;
  actorUserId: string;
  entityType: EntityType;
  entityId: string;
  payload: T;
}

export class Event<T> extends Entity {
  private _type: EventType;
  private _actorUserId: string;
  private _entityType: EntityType;
  private _entityId: string;
  private _payload: T;

  static EventType = EventType;

  constructor({
    id,
    createdAt,
    updatedAt,
    type,
    actorUserId,
    entityType,
    entityId,
    payload,
  }: EventData<T>) {
    super({ id, createdAt, updatedAt });
    this._type = type;
    this._actorUserId = actorUserId;
    this._entityType = entityType;
    this._entityId = entityId;
    this._payload = payload;
  }

  get toJSON() {
    return {
      id: this.id,
      type: this._type,
      actorUserId: this._actorUserId,
      entityType: this._entityType,
      entityId: this._entityId,
      payload: this._payload,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static parse<U>(data: unknown): Event<U> {
    const parsed = this.schema.parse(data) as EventData<U>;
    return new Event<U>(parsed);
  }

  get type(): EventType {
    return this._type;
  }

  get actorUserId(): string {
    return this._actorUserId;
  }

  get entityType(): EntityType {
    return this._entityType;
  }

  get entityId(): string {
    return this._entityId;
  }

  get payload(): T {
    return this._payload;
  }

  static get schema() {
    return object({
      type: zEnum(EventType),
      actorUserId: uuid(),
      entityType: zEnum(EntityType),
      entityId: uuid(),
      payload: json(),
    });
  }

  static override get bodySchema() {
    return super.bodySchema.extend(this.schema.shape);
  }
}
