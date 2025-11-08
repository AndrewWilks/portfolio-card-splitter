import { Tag } from "@shared/entities";
import { Repository } from "./base/repository.ts";
import { eq } from "drizzle-orm";
import { Tables } from "@db/tables";
import { objectKeysToCamel } from "@shared/utilities";

export class TagRepository extends Repository<"Tag"> {
  constructor() {
    super("Tag");
  }

  async findByName(name: string): Promise<Tag | null> {
    const result = await this.dbClient
      .select()
      .from(Tables.tags)
      .where(eq(Tables.tags.name, name))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const camelCaseData = objectKeysToCamel(
      result[0] as Record<string, unknown>
    );
    // deno-lint-ignore no-explicit-any
    return new Tag(camelCaseData as any);
  }
}
