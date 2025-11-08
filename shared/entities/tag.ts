import { object, string } from "zod";
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

  private _name: string = Tag.DEFAULT_NAME;
  private _color: HexColor = Tag.DEFAULT_COLOR;

  constructor({ id, createdAt, updatedAt, name, color, isActive }: TagData) {
    super({ id, createdAt, updatedAt, isActive });
    this._name = name;
    this._color = color;
  }

  get name(): string {
    return this._name;
  }

  get color(): HexColor {
    return this._color;
  }

  override get toJSON() {
    return {
      id: this.id,
      name: this._name,
      color: this._color,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static parse(data: unknown): Tag {
    const parsed = this.schema.parse(data) as TagData;
    return new Tag(parsed);
  }

  static get schema() {
    return object({
      name: string().min(1).max(100),
      color: zHexColor.default(Tag.DEFAULT_COLOR),
    });
  }

  static override get bodySchema() {
    return super.bodySchema.extend(this.schema.shape);
  }
}
