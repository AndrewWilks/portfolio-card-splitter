import { PotRepository, ReservationRepository } from "../repositories/index.ts";
import { Reservation } from "../entities/index.ts";

export class ReservationService {
  constructor(
    private reservationRepository: ReservationRepository,
    private potRepository: PotRepository,
  ) {}

  createReservation(_request: unknown): Promise<Reservation> {
    throw new Error("Not implemented");
  }

  deleteReservation(_id: string): Promise<void> {
    throw new Error("Not implemented");
  }
}
