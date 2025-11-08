import { Reservation } from "@shared/entities";
import { Repository } from "./base/repository.ts";
import { eq } from "drizzle-orm";
import { Tables } from "@db/tables";
import { objectKeysToCamel } from "@shared/utilities";

export class ReservationRepository extends Repository<"Reservation"> {
  constructor() {
    super("Reservation");
  }

  async findByPotId(potId: string): Promise<Reservation[]> {
    const found = await this.dbClient
      .select()
      .from(Tables.reservations)
      .where(eq(Tables.reservations.potId, potId));

    if (found.length === 0) {
      return [];
    }

    return found.map((row) => {
      const camelCaseData = objectKeysToCamel(row as Record<string, unknown>);
      // deno-lint-ignore no-explicit-any
      return new Reservation(camelCaseData as any);
    });
  }

  async findByTransactionId(transactionId: string): Promise<Reservation[]> {
    const found = await this.dbClient
      .select()
      .from(Tables.reservations)
      .where(eq(Tables.reservations.transactionId, transactionId));

    if (found.length === 0) {
      return [];
    }

    return found.map((row) => {
      const camelCaseData = objectKeysToCamel(row as Record<string, unknown>);
      // deno-lint-ignore no-explicit-any
      return new Reservation(camelCaseData as any);
    });
  }

  async findByAllocationId(allocationId: string): Promise<Reservation[]> {
    const found = await this.dbClient
      .select()
      .from(Tables.reservations)
      .where(eq(Tables.reservations.allocationId, allocationId));

    if (found.length === 0) {
      return [];
    }

    return found.map((row) => {
      const camelCaseData = objectKeysToCamel(row as Record<string, unknown>);
      // deno-lint-ignore no-explicit-any
      return new Reservation(camelCaseData as any);
    });
  }

  async findByMemberId(memberId: string): Promise<Reservation[]> {
    const found = await this.dbClient
      .select()
      .from(Tables.reservations)
      .where(eq(Tables.reservations.memberId, memberId));

    if (found.length === 0) {
      return [];
    }

    return found.map((row) => {
      const camelCaseData = objectKeysToCamel(row as Record<string, unknown>);
      // deno-lint-ignore no-explicit-any
      return new Reservation(camelCaseData as any);
    });
  }
}
