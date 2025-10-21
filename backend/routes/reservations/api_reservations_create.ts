import { Context } from "hono";
import { ReservationService } from "@backend/services";

export function apiReservationsCreate(
  _c: Context,
  _reservationService: ReservationService
) {
  // TODO: Implement POST /api/reservations endpoint to create a reservation
  // - Validate request body with CreateReservationSchema
  // - Create reservation using ReservationService
  // - Return reservation response with success message
  return _c.json({ message: "Not implemented" }, 501);
}
