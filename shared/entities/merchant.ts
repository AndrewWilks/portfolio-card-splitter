import { z } from "zod";

// For merchants table. Includes normalization logic for fuzzy matching.
export const MerchantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  location: z.string().max(255).optional(),
  mergedIntoId: z.string().uuid().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type MerchantData = z.infer<typeof MerchantSchema>;

export class Merchant {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly location?: string,
    public readonly mergedIntoId?: string,
    public readonly isActive: boolean = true,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  static create(
    data: Omit<MerchantData, "id" | "createdAt" | "updatedAt">
  ): Merchant {
    const validated = MerchantSchema.omit({
      id: true,
      createdAt: true,
      updatedAt: true,
    }).parse(data);

    return new Merchant(
      crypto.randomUUID(),
      validated.name,
      validated.location,
      validated.mergedIntoId,
      validated.isActive,
      new Date(),
      new Date()
    );
  }

  static from(data: MerchantData): Merchant {
    const validated = MerchantSchema.parse(data);
    return new Merchant(
      validated.id,
      validated.name,
      validated.location,
      validated.mergedIntoId,
      validated.isActive,
      validated.createdAt,
      validated.updatedAt
    );
  }

  toJSON(): MerchantData {
    return {
      id: this.id,
      name: this.name,
      location: this.location,
      mergedIntoId: this.mergedIntoId,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
