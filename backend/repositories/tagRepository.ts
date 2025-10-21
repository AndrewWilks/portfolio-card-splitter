import { TagRepository as SharedTagRepository } from "@shared/repositories";
import { Tag } from "@shared/entities";
import { db, Schemas } from "@db";
import { eq } from "drizzle-orm";

export class TagRepository extends SharedTagRepository {
  constructor(private dbClient = db) {
    super();
  }

  override async save(tag: Tag): Promise<void> {
    const data = tag.toJSON();
    await this.dbClient
      .insert(Schemas.Tables.tags)
      .values({
        id: data.id,
        name: data.name,
        color: data.color,
        isActive: data.isActive,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })
      .onConflictDoUpdate({
        target: Schemas.Tables.tags.id,
        set: {
          name: data.name,
          color: data.color,
          isActive: data.isActive,
          updatedAt: data.updatedAt,
        },
      });
  }

  override async findById(id: string): Promise<Tag | null> {
    const result = await this.dbClient
      .select()
      .from(Schemas.Tables.tags)
      .where(eq(Schemas.Tables.tags.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return Tag.from(result[0]);
  }

  override async findAll(): Promise<Tag[]> {
    const result = await this.dbClient
      .select()
      .from(Schemas.Tables.tags)
      .orderBy(Schemas.Tables.tags.name);

    return result.map((row) => Tag.from(row));
  }

  override async findByName(name: string): Promise<Tag | null> {
    const result = await this.dbClient
      .select()
      .from(Schemas.Tables.tags)
      .where(eq(Schemas.Tables.tags.name, name))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return Tag.from(result[0]);
  }
}
