import { Reservation } from "../entities/reservation.ts";

interface I_ReservationRepository {
  save(reservation: Reservation): Promise<void>;
  findById(id: string): Promise<Reservation | null>;
  findByPotId(potId: string): Promise<Reservation[]>;
  delete(id: string): Promise<void>;
}

export class ReservationRepository implements I_ReservationRepository {
  save(_reservation: Reservation): Promise<void> {
    return Promise.reject("Not implemented");
  }

  findById(_id: string): Promise<Reservation | null> {
    return Promise.reject("Not implemented");
  }

  findByPotId(_potId: string): Promise<Reservation[]> {
    return Promise.reject("Not implemented");
  }

  delete(_id: string): Promise<void> {
    return Promise.reject("Not implemented");
  }
}
