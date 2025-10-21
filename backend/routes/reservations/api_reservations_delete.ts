import { Context } from "hono";
import { ReservationService } from "@backend/services";

export function apiReservationsDelete(
  _c: Context,
  _reservationService: ReservationService,
) {
  // TODO: Implement DELETE /api/reservations/:id endpoint to delete a reservation
  // - Extract id from params
  // - Delete reservation using ReservationService
  // - Return success message
  return _c.json({ message: "Not implemented" }, 501);
}
