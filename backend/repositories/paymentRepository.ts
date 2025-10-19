import { PaymentRepository as SharedPaymentRepository } from "@shared/repositories";
import { Payment } from "@shared/entities";

export class PaymentRepository extends SharedPaymentRepository {
  override save(_payment: Payment): Promise<void> {
    // TODO: Implement save method to insert payment into database
    return Promise.reject("Not implemented");
  }

  override findById(_id: string): Promise<Payment | null> {
    // TODO: Implement findById method to query payment by ID from database
    return Promise.reject("Not implemented");
  }

  override findByPotId(_potId: string): Promise<Payment[]> {
    // TODO: Implement findByPotId method to query payments by pot ID from database
    return Promise.reject("Not implemented");
  }

  override findByTransactionId(_transactionId: string): Promise<Payment[]> {
    // TODO: Implement findByTransactionId method to query payments by transaction ID from database
    return Promise.reject("Not implemented");
  }
}
