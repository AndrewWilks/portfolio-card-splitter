import { PaymentService as SharedPaymentService } from "@shared/services";
import { Payment } from "@shared/entities";

export class PaymentService extends SharedPaymentService {
  override createPayment(_request: unknown): Promise<Payment> {
    // TODO: Implement createPayment method to create and save new payment
    return Promise.reject(new Error("Not implemented"));
  }
}
