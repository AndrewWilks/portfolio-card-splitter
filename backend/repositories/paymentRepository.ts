import { Payment } from "@shared/entities";
import { Repository } from "./base/repository.ts";
import { eq } from "drizzle-orm";
import { Tables } from "@db/tables";
import { objectKeysToCamel } from "@shared/utilities";

export class PaymentRepository extends Repository<"Payment"> {
  constructor() {
    super("Payment");
  }

  async findByPotId(potId: string): Promise<Payment[]> {
    const found = await this.dbClient
      .select()
      .from(Tables.payments)
      .where(eq(Tables.payments.potId, potId));

    if (found.length === 0) {
      return [];
    }

    return found.map((row) => {
      const camelCaseData = objectKeysToCamel(row as Record<string, unknown>);
      // deno-lint-ignore no-explicit-any
      return new Payment(camelCaseData as any);
    });
  }

  async findByTransactionId(transactionId: string): Promise<Payment[]> {
    const found = await this.dbClient
      .select()
      .from(Tables.payments)
      .where(eq(Tables.payments.transactionId, transactionId));

    if (found.length === 0) {
      return [];
    }

    return found.map((row) => {
      const camelCaseData = objectKeysToCamel(row as Record<string, unknown>);
      // deno-lint-ignore no-explicit-any
      return new Payment(camelCaseData as any);
    });
  }

  async findByReservationId(reservationId: string): Promise<Payment | null> {
    const found = await this.dbClient
      .select()
      .from(Tables.payments)
      .where(eq(Tables.payments.reservationId, reservationId))
      .limit(1);

    if (found.length === 0) {
      return null;
    }

    const camelCaseData = objectKeysToCamel(
      found[0] as Record<string, unknown>
    );
    // deno-lint-ignore no-explicit-any
    return new Payment(camelCaseData as any);
  }
}
