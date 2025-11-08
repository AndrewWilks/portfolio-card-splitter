import { Member } from "@shared/entities";
import { eq, and } from "drizzle-orm";
import { Tables } from "@db/tables";
import { Repository } from "./base/repository.ts";
import { objectKeysToCamel } from "@shared/utilities";

export class MemberRepository extends Repository<"Member"> {
  constructor() {
    super("Member");
  }

  async findByEmail(
    _email: string,
    _isActive?: boolean
  ): Promise<Member | null> {
    const found = await this.dbClient
      .select()
      .from(Tables.members)
      .innerJoin(Tables.users, eq(Tables.members.userId, Tables.users.id))
      .where(
        and(
          eq(Tables.users.email, _email),
          _isActive !== undefined
            ? eq(Tables.members.isActive, _isActive)
            : undefined
        )
      );

    if (found.length === 0) {
      return null;
    }

    if (found.length > 1) {
      throw new Error(`Multiple members found with email: ${_email}`);
    }

    const camelCaseData = objectKeysToCamel(
      found[0].members as Record<string, unknown>
    );
    // deno-lint-ignore no-explicit-any
    return new Member(camelCaseData as any);
  }

  async findByStatus(_status: string): Promise<Member[]> {
    const isActive = _status === "active" ? true : false;

    const found = await this.dbClient
      .select()
      .from(Tables.members)
      .where(eq(Tables.members.isActive, isActive))
      .orderBy(Tables.members.createdAt);

    return found.map((row) => {
      const camelCaseData = objectKeysToCamel(row as Record<string, unknown>);
      // deno-lint-ignore no-explicit-any
      return new Member(camelCaseData as any);
    });
  }

  async findByUserId(_userId: string): Promise<Member[]> {
    const found = await this.dbClient
      .select()
      .from(Tables.members)
      .where(eq(Tables.members.userId, _userId))
      .orderBy(Tables.members.createdAt);

    return found.map((row) => {
      const camelCaseData = objectKeysToCamel(row as Record<string, unknown>);
      // deno-lint-ignore no-explicit-any
      return new Member(camelCaseData as any);
    });
  }
}
