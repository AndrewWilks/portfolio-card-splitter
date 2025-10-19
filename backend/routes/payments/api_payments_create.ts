import { Context } from "hono";
import { PaymentService } from "@backend/services";

export function apiPaymentsCreate(
  _c: Context,
  _paymentService: PaymentService
) {
  // TODO: Implement POST /api/payments endpoint to create a payment
  // - Validate request body with CreatePaymentSchema
  // - Create payment using PaymentService
  // - Return payment response with success message
  return _c.json({ message: "Not implemented" }, 501);
}
