import { z } from "zod";
import { EntityData, Entity } from "@shared/entities";
import { HexColor, zHexColor } from "@shared/types";

// For tags table. Manages colors and uniqueness.
export interface TagData extends EntityData {
  name: string;
  color: HexColor;
  isActive: boolean;
}

export class Tag extends Entity {
  static readonly DEFAULT_COLOR = "#3b82f6" as HexColor;
  static readonly DEFAULT_NAME = "Untitled Tag";
  static readonly DEFAULT_IS_ACTIVE = true;

  private _name: string = Tag.DEFAULT_NAME;
  private _color: HexColor = Tag.DEFAULT_COLOR;
  private _isActive: boolean = Tag.DEFAULT_IS_ACTIVE;

  constructor({ id, createdAt, updatedAt, name, color, isActive }: TagData) {
    super({ id, createdAt, updatedAt });
    this._name = name;
    this._color = color;
    this._isActive = isActive;
  }

  get toJSON() {
    return {
      id: this.id,
      name: this._name,
      color: this._color,
      isActive: this._isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static parse(data: unknown): Tag {
    const parsed = this.schema.parse(data) as TagData;
    return new Tag(parsed);
  }

  static get schema() {
    return z.object({
      name: z.string().min(1).max(100),
      color: zHexColor.default(Tag.DEFAULT_COLOR),
      isActive: z.boolean().default(Tag.DEFAULT_IS_ACTIVE),
    });
  }

  static override get bodySchema() {
    return super.bodySchema.extend(this.schema.shape);
  }
}
