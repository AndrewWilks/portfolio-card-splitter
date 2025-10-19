import { Payment } from "../entities/payment.ts";

interface I_PaymentRepository {
  save(payment: Payment): Promise<void>;
  findById(id: string): Promise<Payment | null>;
  findByPotId(potId: string): Promise<Payment[]>;
  findByTransactionId(transactionId: string): Promise<Payment[]>;
}

export class PaymentRepository implements I_PaymentRepository {
  save(_payment: Payment): Promise<void> {
    return Promise.reject("Not implemented");
  }

  findById(_id: string): Promise<Payment | null> {
    return Promise.reject("Not implemented");
  }

  findByPotId(_potId: string): Promise<Payment[]> {
    return Promise.reject("Not implemented");
  }

  findByTransactionId(_transactionId: string): Promise<Payment[]> {
    return Promise.reject("Not implemented");
  }
}
