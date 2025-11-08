import { Event } from "@shared/entities";
import { Repository } from "./base/repository.ts";
import { eq, and } from "drizzle-orm";
import { Tables } from "@db/tables";
import { objectKeysToCamel } from "@shared/utilities";

export class EventRepository extends Repository<"Event"> {
  constructor() {
    super("Event");
  }

  async findByEntity<T>(
    entityType: string,
    entityId: string
  ): Promise<Event<T>[]> {
    const found = await this.dbClient
      .select()
      .from(Tables.events)
      .where(
        and(
          eq(Tables.events.entityType, entityType),
          eq(Tables.events.entityId, entityId)
        )
      );

    if (found.length === 0) {
      return [];
    }

    return found.map((row) => {
      const camelCaseData = objectKeysToCamel(row as Record<string, unknown>);
      // deno-lint-ignore no-explicit-any
      return new Event<T>(camelCaseData as any);
    });
  }

  async findByActor<T>(actorId: string): Promise<Event<T>[]> {
    const found = await this.dbClient
      .select()
      .from(Tables.events)
      .where(eq(Tables.events.actorId, actorId));

    if (found.length === 0) {
      return [];
    }

    return found.map((row) => {
      const camelCaseData = objectKeysToCamel(row as Record<string, unknown>);
      // deno-lint-ignore no-explicit-any
      return new Event<T>(camelCaseData as any);
    });
  }
}
