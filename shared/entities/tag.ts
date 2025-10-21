import { z } from "zod";

// For tags table. Manages colors and uniqueness.
export const TagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .default("#3b82f6"),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TagData = z.infer<typeof TagSchema>;

export class Tag {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly color: string = "#3b82f6",
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  static create(
    data: Omit<TagData, "id" | "createdAt" | "updatedAt" | "color"> & {
      color?: string;
    },
  ): Tag {
    const validated = TagSchema.omit({
      id: true,
      createdAt: true,
      updatedAt: true,
    }).parse({
      color: "#3b82f6", // Provide default
      ...data,
    });

    return new Tag(
      crypto.randomUUID(),
      validated.name,
      validated.color,
      validated.isActive,
      new Date(),
      new Date(),
    );
  }

  static from(data: TagData): Tag {
    const validated = TagSchema.parse(data);
    return new Tag(
      validated.id,
      validated.name,
      validated.color,
      validated.isActive,
      validated.createdAt,
      validated.updatedAt,
    );
  }

  toJSON(): TagData {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
