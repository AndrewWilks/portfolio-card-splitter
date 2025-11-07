import { Context } from "hono";
import { PaymentService } from "@backend/services";
import { Payment } from "@shared/entities";
import { z } from "zod";

// Request schema for HTTP API (dates as strings)
const CreatePaymentRequestSchema = Payment.createSchema.extend({
  paidOn: z.string().datetime(),
});

export async function apiPaymentsCreate(
  c: Context,
  paymentService: PaymentService
) {
  try {
    const body = await c.req.json();
    const validatedRequest = CreatePaymentRequestSchema.parse(body);

    // Transform date string to Date object for service
    const payment = await paymentService.createPayment({
      ...validatedRequest,
      paidOn: new Date(validatedRequest.paidOn),
    });

    return c.json(
      {
        payment: payment.toJSON,
        message: "Payment created successfully",
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
