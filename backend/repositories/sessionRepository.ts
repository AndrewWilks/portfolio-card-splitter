import { Repository } from "./base/repository.ts";
import { eq, lt } from "drizzle-orm";
import { Tables } from "@db/tables";
import { Session } from "@shared/entities";

export class SessionRepository extends Repository<"Session"> {
  constructor() {
    super("Session");
  }

  async deleteExpired(): Promise<number> {
    const deleted = await this.dbClient
      .delete(Tables.sessions)
      .where(lt(Tables.sessions.expiresAt, new Date()))
      .returning();

    return deleted.length;
  }

  async findByUserId(userId: string): Promise<Session[]> {
    return (await this.dbClient
      .select()
      .from(Tables.sessions)
      .where(eq(Tables.sessions.userId, userId))) as Session[];
  }
}
