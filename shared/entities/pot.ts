// For pots table. Includes balance tracking, ACLs, and available balance calculations.

import { z } from "zod";

export const PotSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(["solo", "shared"]),
  location: z.string().max(200).optional(),
  ownerId: z.string().uuid(),
  balanceCents: z.number().int().min(0),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PotData = z.infer<typeof PotSchema>;

export class Pot {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | undefined,
    public readonly type: "solo" | "shared",
    public readonly location: string | undefined,
    public readonly ownerId: string,
    public readonly balanceCents: number = 0,
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  static create(data: Omit<PotData, "id" | "createdAt" | "updatedAt">): Pot {
    const validated = PotSchema.omit({
      id: true,
      createdAt: true,
      updatedAt: true,
    }).parse(data);

    return new Pot(
      crypto.randomUUID(),
      validated.name,
      validated.description,
      validated.type,
      validated.location,
      validated.ownerId,
      validated.balanceCents,
      validated.isActive,
      new Date(),
      new Date(),
    );
  }

  static from(data: PotData): Pot {
    const validated = PotSchema.parse(data);
    return new Pot(
      validated.id,
      validated.name,
      validated.description,
      validated.type,
      validated.location,
      validated.ownerId,
      validated.balanceCents,
      validated.isActive,
      validated.createdAt,
      validated.updatedAt,
    );
  }

  toJSON(): PotData {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      location: this.location,
      ownerId: this.ownerId,
      balanceCents: this.balanceCents,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
