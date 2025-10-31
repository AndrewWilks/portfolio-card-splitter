import { uuid, object, string, boolean } from "zod";
import { Entity, EntityData } from "@shared/entities";

// For members table. Links to users, handles display names and archiving.

interface MemberData extends EntityData {
  userId: string;
  displayName: string;
  archived: boolean;
}

export class Member extends Entity {
  private _userId: string;
  private _displayName: string;
  private _archived: boolean;

  constructor({
    id,
    createdAt,
    updatedAt,
    userId,
    displayName,
    archived,
  }: MemberData) {
    super({ id, createdAt, updatedAt });
    this._userId = userId;
    this._displayName = displayName;
    this._archived = archived;
  }

  get toJSON() {
    return {
      id: this.id,
      userId: this._userId,
      displayName: this._displayName,
      archived: this._archived,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static parse(data: unknown): Member {
    const parsed = this.schema.parse(data) as MemberData;
    return new Member(parsed);
  }

  // Validation schema
  static schema = object({
    userId: uuid(),
    displayName: string().min(1).max(255),
    archived: boolean().default(false),
  });

  static override get bodySchema() {
    return super.bodySchema.extend(this.schema.shape);
  }
}
