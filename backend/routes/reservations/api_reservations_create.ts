import { Context } from "hono";
import { ReservationService } from "@backend/services";
import { Reservation } from "@shared/entities";
import { z } from "zod";

export async function apiReservationsCreate(
  c: Context,
  reservationService: ReservationService
) {
  try {
    const body = await c.req.json();
    // Use entity schema directly (no date transformation needed for reservations)
    const validatedRequest = Reservation.createSchema.parse(body);

    const reservation = await reservationService.createReservation(
      validatedRequest
    );

    return c.json(
      {
        reservation: reservation.toJSON,
        message: "Reservation created successfully",
      },
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: "Validation failed", details: error.issues }, 400);
    }
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
}
