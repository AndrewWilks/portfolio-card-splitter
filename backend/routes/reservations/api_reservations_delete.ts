import { Context } from "hono";

export function apiReservationsDelete(c: Context) {
  // TODO: Implement DELETE /api/reservations/:id endpoint to delete a reservation
  // - Extract id from params
  // - Delete reservation using ReservationService
  // - Return success message
  return c.json({ message: "Not implemented" }, 501);
}
