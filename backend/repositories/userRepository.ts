import { User, UserRole } from "@shared/entities";
import { Repository } from "./base/repository.ts";
import { and, eq } from "drizzle-orm";
import { Tables } from "@db/tables";
import { objectKeysToCamel } from "@shared/utilities";

export class UserRepository extends Repository<"User"> {
  constructor() {
    super("User");
  }

  async findByEmail(email: string, isActive?: boolean): Promise<User | null> {
    const found = await this.dbClient
      .select()
      .from(Tables.users)
      .where(
        and(
          eq(Tables.users.email, email),
          isActive !== undefined
            ? eq(Tables.users.isActive, isActive)
            : undefined
        )
      );

    if (found.length === 0) {
      return null;
    }

    if (found.length > 1) {
      throw new Error(`Multiple users found with email: ${email}`);
    }

    const camelCaseData = objectKeysToCamel(
      found[0] as Record<string, unknown>
    );
    // deno-lint-ignore no-explicit-any
    return new User(camelCaseData as any);
  }

  async findByRole(role: UserRole, isActive?: boolean): Promise<User[]> {
    const found = await this.dbClient
      .select()
      .from(Tables.users)
      .where(
        and(
          eq(Tables.users.role, role),
          isActive !== undefined
            ? eq(Tables.users.isActive, isActive)
            : undefined
        )
      );

    if (found.length === 0) {
      return [];
    }

    return found.map((row) => {
      const camelCaseData = objectKeysToCamel(row as Record<string, unknown>);
      // deno-lint-ignore no-explicit-any
      return new User(camelCaseData as any);
    });
  }
}
