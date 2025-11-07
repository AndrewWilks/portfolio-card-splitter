import { Pot, PotScope, PotVisibility } from "@shared/entities";
import { PotRepository } from "@backend/repositories";
import { ReservationRepository } from "@backend/repositories";
import { z } from "zod";
import { UUID } from "node:crypto";
import { Cents } from "@shared/types";

const createPotSchema = z.object({
  name: z.string().min(1).max(100),
  balanceCents: z.number().int().min(0),
  scope: z.nativeEnum(PotScope),
  ownerId: z.string().uuid(),
  accountType: z.string(),
  institution: z.string().max(100).optional(),
  maskingAccount: z.string().max(20).optional(),
  physicalLocation: z.string().max(100).optional(),
  visibilityAcls: z.record(z.string(), z.nativeEnum(PotVisibility)).optional(),
});

const updatePotSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  balanceCents: z.number().int().min(0).optional(),
  institution: z.string().max(100).optional(),
  maskingAccount: z.string().max(20).optional(),
  physicalLocation: z.string().max(100).optional(),
  visibilityAcls: z.record(z.string(), z.nativeEnum(PotVisibility)).optional(),
});

/**
 * PotService - Manages pot operations with ACL enforcement
 */
export class PotService {
  constructor(
    private potRepository: PotRepository,
    private reservationRepository: ReservationRepository
  ) {}

  /**
   * Check if a user has visibility access to a pot
   * @param pot - The pot to check
   * @param userId - The user requesting access
   * @param requiredLevel - The required visibility level (default: READ)
   * @returns true if user has access, false otherwise
   */
  private hasVisibility(
    pot: Pot,
    userId: string,
    requiredLevel: PotVisibility = PotVisibility.READ
  ): boolean {
    // Owner always has full access
    if (pot.ownerId === userId) {
      return true;
    }

    // For SOLO pots, only owner can see
    if ((pot as unknown as { scope: PotScope }).scope === PotScope.SOLO) {
      return false;
    }

    // Check ACL for SHARED pots
    const acls = (
      pot as unknown as { visibilityAcls?: Map<UUID, PotVisibility> }
    ).visibilityAcls;
    if (!acls) {
      return false;
    }

    const userAccess = acls.get(userId as UUID);
    if (!userAccess) {
      return false;
    }

    // If READ required, any access level is sufficient
    if (requiredLevel === PotVisibility.READ) {
      return true;
    }

    // If MANAGE required, must have MANAGE access
    return userAccess === PotVisibility.MANAGE;
  }

  /**
   * List pots visible to the requesting user
   * @param userId - The user requesting the list
   * @returns Array of pots the user can see
   */
  async listPots(userId: string): Promise<Pot[]> {
    const allPots = await this.potRepository.findAll();

    // Handle null case
    if (!allPots || allPots.length === 0) {
      return [];
    }

    // Filter pots based on visibility
    const visiblePots = allPots.filter((pot) =>
      this.hasVisibility(pot, userId, PotVisibility.READ)
    );

    // Enrich with derived values (reserved/available)
    const enrichedPots = await Promise.all(
      visiblePots.map(async (pot) => {
        const reservations = await this.reservationRepository.findByPotId(
          pot.id
        );
        const reservationAmounts = reservations.map(
          (r) => r.amountCents as Cents
        );
        return pot.withDerivedValues(reservationAmounts);
      })
    );

    return enrichedPots;
  }

  /**
   * Get a single pot by ID with visibility check
   * @param potId - The pot ID
   * @param userId - The user requesting access
   * @returns The pot with derived values
   * @throws Error if pot not found or user lacks visibility
   */
  async getPot(potId: string, userId: string): Promise<Pot> {
    const pot = await this.potRepository.findById(potId);
    if (!pot) {
      throw new Error(`Pot with ID ${potId} not found`);
    }

    if (!this.hasVisibility(pot, userId, PotVisibility.READ)) {
      throw new Error(`User ${userId} does not have access to pot ${potId}`);
    }

    // Enrich with derived values
    const reservations = await this.reservationRepository.findByPotId(pot.id);
    const reservationAmounts = reservations.map((r) => r.amountCents as Cents);
    return pot.withDerivedValues(reservationAmounts);
  }

  /**
   * Create a new pot
   * @param request - The pot creation request
   * @returns The created pot
   */
  async createPot(request: unknown): Promise<Pot> {
    const validatedRequest = createPotSchema.parse(request);

    const pot = Pot.parse(validatedRequest);
    const [savedPot] = await this.potRepository.save(pot);

    // Return with empty derived values (no reservations yet)
    return savedPot.withDerivedValues([]);
  }

  /**
   * Update an existing pot with visibility check
   * @param id - The pot ID
   * @param request - The update request
   * @param userId - The user requesting the update
   * @returns The updated pot
   * @throws Error if pot not found or user lacks MANAGE access
   */
  async updatePot(id: string, request: unknown, userId: string): Promise<Pot> {
    const validatedRequest = updatePotSchema.parse(request);

    const existing = await this.potRepository.findById(id);
    if (!existing) {
      throw new Error(`Pot with ID ${id} not found`);
    }

    // User must have MANAGE access to update
    if (!this.hasVisibility(existing, userId, PotVisibility.MANAGE)) {
      throw new Error(
        `User ${userId} does not have MANAGE access to pot ${id}`
      );
    }

    const updated = Pot.parse({
      ...existing.toJSON,
      ...validatedRequest,
      id,
    });

    const [savedPot] = await this.potRepository.save(updated);

    // Enrich with derived values
    const reservations = await this.reservationRepository.findByPotId(
      savedPot.id
    );
    const reservationAmounts = reservations.map((r) => r.amountCents as Cents);
    return savedPot.withDerivedValues(reservationAmounts);
  }

  /**
   * Deposit funds into a pot with visibility check
   * @param id - The pot ID
   * @param amountCents - The amount to deposit
   * @param userId - The user making the deposit
   * @throws Error if pot not found or user lacks MANAGE access
   */
  async deposit(
    id: string,
    amountCents: number,
    userId: string
  ): Promise<void> {
    const existing = await this.potRepository.findById(id);
    if (!existing) {
      throw new Error(`Pot with ID ${id} not found`);
    }

    // User must have MANAGE access to deposit
    if (!this.hasVisibility(existing, userId, PotVisibility.MANAGE)) {
      throw new Error(
        `User ${userId} does not have MANAGE access to pot ${id}`
      );
    }

    if (amountCents <= 0) {
      throw new Error("Deposit amount must be positive");
    }

    const updated = Pot.parse({
      ...existing.toJSON,
      balanceCents: existing.balanceCents + amountCents,
      id,
    });

    await this.potRepository.save(updated);
  }
}
