import { Reservation } from "@shared/entities";
import {
  ReservationRepository,
  PotRepository,
  TransactionRepository,
  MemberRepository,
} from "@backend/repositories";
import { type z } from "zod";

// Type export using entity schema
export type CreateReservationRequest = z.infer<typeof Reservation.createSchema>;

export class ReservationService {
  constructor(
    private reservationRepo: ReservationRepository,
    private potRepo: PotRepository,
    private transactionRepo: TransactionRepository,
    private memberRepo: MemberRepository
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

    // Create reservation entity
    const reservation = new Reservation({
      potId: validatedData.potId,
      transactionId: validatedData.transactionId,
      memberId: validatedData.memberId,
      amountCents: validatedData.amountCents,
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
