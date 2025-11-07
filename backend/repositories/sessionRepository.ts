import { Repository } from "./base/repository.ts";
import { lt } from "drizzle-orm";
import { Tables } from "@db/tables";

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
}
