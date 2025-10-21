import { ReservationRepository as SharedReservationRepository } from "@shared/repositories";
import { Reservation } from "@shared/entities";

export class ReservationRepository extends SharedReservationRepository {
  override save(_reservation: Reservation): Promise<void> {
    // TODO: Implement save method to insert reservation into database
    return Promise.reject("Not implemented");
  }

  override findById(_id: string): Promise<Reservation | null> {
    // TODO: Implement findById method to query reservation by ID from database
    return Promise.reject("Not implemented");
  }

  override findByPotId(_potId: string): Promise<Reservation[]> {
    // TODO: Implement findByPotId method to query reservations by pot ID from database
    return Promise.reject("Not implemented");
  }

  override delete(_id: string): Promise<void> {
    // TODO: Implement delete method to remove reservation from database
    return Promise.reject("Not implemented");
  }
}
