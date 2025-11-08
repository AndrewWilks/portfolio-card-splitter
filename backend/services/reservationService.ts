import { Reservation } from "@shared/entities";
import {
  ReservationRepository,
  PotRepository,
  TransactionRepository,
  MemberRepository,
  AllocationRepository,
} from "@backend/repositories";
import { type z } from "zod";

// Type export using entity schema
export type CreateReservationRequest = z.infer<typeof Reservation.createSchema>;

export class ReservationService {
  constructor(
    private reservationRepo: ReservationRepository,
    private potRepo: PotRepository,
    private transactionRepo: TransactionRepository,
    private memberRepo: MemberRepository,
    private allocationRepo: AllocationRepository
  ) {}

  async createReservation(data: unknown): Promise<Reservation> {
    // Validate request using entity schema
    const validatedData = Reservation.createSchema.parse(data);

    // Validate pot exists
    const pot = await this.potRepo.findById(validatedData.potId);
    if (!pot) {
      throw new Error(`Pot not found: ${validatedData.potId}`);
    }

    // Validate transaction exists
    const transaction = await this.transactionRepo.findById(
      validatedData.transactionId
    );
    if (!transaction) {
      throw new Error(`Transaction not found: ${validatedData.transactionId}`);
    }

    // Validate member exists
    const member = await this.memberRepo.findById(validatedData.memberId);
    if (!member) {
      throw new Error(`Member not found: ${validatedData.memberId}`);
    }

    // Validate allocation exists if provided
    if (validatedData.allocationId) {
      const allocation = await this.allocationRepo.findById(
        validatedData.allocationId
      );
      if (!allocation) {
        throw new Error(`Allocation not found: ${validatedData.allocationId}`);
      }

      // Validate allocation belongs to the same transaction
      const allocationData = allocation.toJSON;
      if (allocationData.transactionId !== validatedData.transactionId) {
        throw new Error(
          `Allocation ${validatedData.allocationId} does not belong to transaction ${validatedData.transactionId}`
        );
      }

      // Validate allocation belongs to the member
      if (allocationData.memberId !== validatedData.memberId) {
        throw new Error(
          `Allocation ${validatedData.allocationId} does not belong to member ${validatedData.memberId}`
        );
      }

      // Validate reservation amount doesn't exceed allocation amount
      const allocationAmount = allocationData.amountCents;
      if (validatedData.amountCents > allocationAmount) {
        throw new Error(
          `Reservation amount ${validatedData.amountCents} exceeds allocation amount ${allocationAmount}`
        );
      }
    }

    // Validate reservation doesn't exceed transaction total
    const transactionData = transaction.toJSON;
    if (validatedData.amountCents > transactionData.amountCents) {
      throw new Error(
        `Reservation amount ${validatedData.amountCents} exceeds transaction total ${transactionData.amountCents}`
      );
    }

    // Get existing reservations for this transaction
    const existingReservations = await this.reservationRepo.findByTransactionId(
      validatedData.transactionId
    );

    // Calculate total reserved amount
    const totalReserved = existingReservations.reduce(
      (sum, r) => sum + r.amountCents,
      0
    );

    // Validate total reservations won't exceed transaction amount
    const newTotal = totalReserved + validatedData.amountCents;
    if (newTotal > transactionData.amountCents) {
      throw new Error(
        `Total reservations (${newTotal}) would exceed transaction amount (${transactionData.amountCents}). Already reserved: ${totalReserved}`
      );
    }

    // Validate pot has sufficient balance (check available balance)
    const potData = pot.toJSON;
    const potBalance = potData.balanceCents;

    // Get all existing reservations for this pot
    const potReservations = await this.reservationRepo.findByPotId(
      validatedData.potId
    );
    const totalPotReservations = potReservations.reduce(
      (sum, r) => sum + r.amountCents,
      0
    );

    // Check if pot has enough balance for new reservation
    const availableBalance = potBalance - totalPotReservations;
    if (validatedData.amountCents > availableBalance) {
      throw new Error(
        `Insufficient pot balance. Available: ${availableBalance}, requested: ${validatedData.amountCents}. (Balance: ${potBalance}, already reserved: ${totalPotReservations})`
      );
    }

    // Create reservation entity
    const reservation = new Reservation({
      potId: validatedData.potId,
      transactionId: validatedData.transactionId,
      memberId: validatedData.memberId,
      amountCents: validatedData.amountCents,
      allocationId: validatedData.allocationId,
      createdById: validatedData.createdById,
    });

    // Save to database
    const saved = await this.reservationRepo.save(reservation);
    return saved[0] as Reservation;
  }

  async deleteReservation(id: string): Promise<void> {
    const reservation = await this.reservationRepo.findById(id);
    if (!reservation) {
      throw new Error(`Reservation not found: ${id}`);
    }
    await this.reservationRepo.delete(id);
  }

  async findById(id: string): Promise<Reservation | null> {
    return await this.reservationRepo.findById(id);
  }

  async findByTransactionId(transactionId: string): Promise<Reservation[]> {
    return await this.reservationRepo.findByTransactionId(transactionId);
  }

  async findByPotId(potId: string): Promise<Reservation[]> {
    return await this.reservationRepo.findByPotId(potId);
  }

  async findByMemberId(memberId: string): Promise<Reservation[]> {
    return await this.reservationRepo.findByMemberId(memberId);
  }
}
