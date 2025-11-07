import { Payment } from "@shared/entities";
import {
  PaymentRepository,
  TransactionRepository,
  PotRepository,
  ReservationRepository,
} from "@backend/repositories";
import { type z } from "zod";

// Type export using entity schema
export type CreatePaymentRequest = z.infer<typeof Payment.createSchema>;

export class PaymentService {
  constructor(
    private paymentRepo: PaymentRepository,
    private transactionRepo: TransactionRepository,
    private potRepo: PotRepository,
    private reservationRepo: ReservationRepository
  ) {}

  async createPayment(data: unknown): Promise<Payment> {
    // Validate request using entity schema
    const validatedData = Payment.createSchema.parse(data);

    // Validate pot exists
    const pot = await this.potRepo.findById(validatedData.potId);
    if (!pot) {
      throw new Error("Pot not found");
    }

    // Validate transaction exists
    const transaction = await this.transactionRepo.findById(
      validatedData.transactionId
    );
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Validate reservation if provided
    if (validatedData.reservationId) {
      const reservation = await this.reservationRepo.findById(
        validatedData.reservationId
      );
      if (!reservation) {
        throw new Error("Reservation not found");
      }
    }

    // Validate payment doesn't exceed transaction total
    const existingPayments = await this.paymentRepo.findByTransactionId(
      validatedData.transactionId
    );
    const totalPaid = existingPayments.reduce(
      (sum, p) => sum + p.amountCents,
      0
    );

    const transactionData = transaction.toJSON;
    if (totalPaid + validatedData.amountCents > transactionData.amountCents) {
      throw new Error(
        `Payment would exceed transaction total. Transaction amount: ${transactionData.amountCents}, already paid: ${totalPaid}, attempting to pay: ${validatedData.amountCents}`
      );
    }

    // Check if payment differs from reservations
    const reservations = await this.reservationRepo.findByTransactionId(
      validatedData.transactionId
    );
    
    let needsReconciliation = false;
    if (reservations.length > 0) {
      // Calculate total reserved amount
      const totalReserved = reservations.reduce(
        (sum, r) => sum + r.amountCents,
        0
      );
      
      // Calculate what total paid will be after this payment
      const totalAfterPayment = totalPaid + validatedData.amountCents;
      
      // Flag for reconciliation if totals don't match
      if (totalAfterPayment !== totalReserved) {
        needsReconciliation = true;
      }
    }

    // Create payment entity
    const payment = new Payment({
      potId: validatedData.potId,
      transactionId: validatedData.transactionId,
      amountCents: validatedData.amountCents,
      paidOn: validatedData.paidOn,
      reservationId: validatedData.reservationId,
      note: validatedData.note,
      needsReconciliation,
      createdById: validatedData.createdById,
    });

    // Save and return
    const saved = await this.paymentRepo.save(payment);
    return saved[0] as Payment;
  }

  async findById(id: string): Promise<Payment | null> {
    return await this.paymentRepo.findById(id);
  }

  async findByTransactionId(transactionId: string): Promise<Payment[]> {
    return await this.paymentRepo.findByTransactionId(transactionId);
  }

  async findByPotId(potId: string): Promise<Payment[]> {
    return await this.paymentRepo.findByPotId(potId);
  }
}
