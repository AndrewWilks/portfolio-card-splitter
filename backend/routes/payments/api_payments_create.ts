import { Context } from "hono";

export function apiPaymentsCreate(c: Context) {
  // TODO: Implement POST /api/payments endpoint to create a payment
  // - Validate request body with CreatePaymentSchema
  // - Create payment using PaymentService
  // - Return payment response with success message
  return c.json({ message: "Not implemented" }, 501);
}