import { Context } from "hono";
import { ReservationService } from "@backend/services";

export async function apiReservationsDelete(
  c: Context,
  reservationService: ReservationService
) {
  try {
    const id = c.req.param("id");

    if (!id) {
      return c.json({ error: "Reservation ID is required" }, 400);
    }

    await reservationService.deleteReservation(id);

    return c.json(
      {
        message: "Reservation deleted successfully",
      },
      200
    );
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
}
