import {
  PaymentRepository,
  ReservationRepository,
} from "../repositories/index.ts";
import { Payment } from "../entities/index.ts";

export class PaymentService {
  constructor(
    private paymentRepository: PaymentRepository,
    private reservationRepository: ReservationRepository
  ) {}

  createPayment(_request: unknown): Promise<Payment> {
    throw new Error("Not implemented");
  }
}
