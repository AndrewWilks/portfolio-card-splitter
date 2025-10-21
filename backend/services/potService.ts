import { PotService as SharedPotService } from "@shared/services";
import { Pot } from "@shared/entities";
import { z } from "zod";

// Request schemas
const CreatePotRequestSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: z.enum(["solo", "shared"]).default("solo"),
  location: z.string().max(200).optional(),
  ownerId: z.string().uuid(),
});

const UpdatePotRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  type: z.enum(["solo", "shared"]).optional(),
  location: z.string().max(200).optional(),
  isActive: z.boolean().optional(),
});

const DepositRequestSchema = z.object({
  amountCents: z.number().int().positive(),
});

export type CreatePotRequest = z.infer<typeof CreatePotRequestSchema>;
export type UpdatePotRequest = z.infer<typeof UpdatePotRequestSchema>;
export type DepositRequest = z.infer<typeof DepositRequestSchema>;

export class PotService extends SharedPotService {
  override async listPots(query: Record<string, unknown>): Promise<Pot[]> {
    const ownerId = query.ownerId as string;
    if (!ownerId) {
      throw new Error("ownerId is required");
    }

    return await this.potRepository.findByOwner(ownerId);
  }

  override async createPot(request: unknown): Promise<Pot> {
    const validatedRequest = CreatePotRequestSchema.parse(request);

    const pot = Pot.create({
      name: validatedRequest.name,
      description: validatedRequest.description,
      type: validatedRequest.type,
      location: validatedRequest.location,
      ownerId: validatedRequest.ownerId,
      balanceCents: 0,
      isActive: true,
    });

    await this.potRepository.save(pot);
    return pot;
  }

  override async updatePot(id: string, request: unknown): Promise<Pot> {
    const validatedRequest = UpdatePotRequestSchema.parse(request);

    const existingPot = await this.potRepository.findById(id);
    if (!existingPot) {
      throw new Error(`Pot with ID ${id} not found`);
    }

    const updatedPot = Pot.from({
      ...existingPot.toJSON(),
      ...validatedRequest,
      updatedAt: new Date(),
    });

    await this.potRepository.save(updatedPot);
    return updatedPot;
  }

  override async deposit(id: string, request: unknown): Promise<void> {
    const validatedRequest = DepositRequestSchema.parse(request);

    const existingPot = await this.potRepository.findById(id);
    if (!existingPot) {
      throw new Error(`Pot with ID ${id} not found`);
    }

    if (!existingPot.isActive) {
      throw new Error(`Cannot deposit to inactive pot`);
    }

    const newBalance = existingPot.balanceCents + validatedRequest.amountCents;
    await this.potRepository.updateBalance(id, newBalance);
  }
}
