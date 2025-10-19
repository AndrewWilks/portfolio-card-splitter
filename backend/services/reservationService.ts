import { ReservationService as SharedReservationService } from "@shared/services";
import { Reservation } from "@shared/entities";

export class ReservationService extends SharedReservationService {
  override createReservation(_request: unknown): Promise<Reservation> {
    // TODO: Implement createReservation method to create and save new reservation
    return Promise.reject(new Error("Not implemented"));
  }

  override deleteReservation(_id: string): Promise<void> {
    // TODO: Implement deleteReservation method to remove reservation
    return Promise.reject(new Error("Not implemented"));
  }
}
