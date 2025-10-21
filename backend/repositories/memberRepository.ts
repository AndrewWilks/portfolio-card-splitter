import { MemberRepository as SharedMemberRepository } from "@shared/repositories";
import { Member } from "@shared/entities";
import { db, Schemas } from "@db";
import { eq } from "drizzle-orm";

export class MemberRepository extends SharedMemberRepository {
  constructor(private dbClient = db) {
    super();
  }

  override async save(member: Member): Promise<void> {
    const data = member.toJSON();
    await this.dbClient
      .insert(Schemas.Tables.members)
      .values({
        id: data.id,
        userId: data.userId,
        displayName: data.displayName,
        archived: data.archived,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })
      .onConflictDoUpdate({
        target: Schemas.Tables.members.id,
        set: {
          displayName: data.displayName,
          archived: data.archived,
          updatedAt: data.updatedAt,
        },
      });
  }

  override async findById(id: string): Promise<Member | null> {
    const result = await this.dbClient
      .select()
      .from(Schemas.Tables.members)
      .where(eq(Schemas.Tables.members.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return Member.from({
      id: result[0].id,
      userId: result[0].userId,
      displayName: result[0].displayName,
      archived: result[0].archived,
      createdAt: result[0].createdAt,
      updatedAt: result[0].updatedAt,
    });
  }

  override findByEmail(_email: string): Promise<Member | null> {
    // Members don't have emails directly - they're linked to users
    // This method doesn't make sense for members, but we implement it for interface compatibility
    return Promise.resolve(null);
  }

  override async findByStatus(status: string): Promise<Member[]> {
    // Interpret status as archived state: "active" = not archived, "archived" = archived
    const isArchived = status === "archived";

    const results = await this.dbClient
      .select()
      .from(Schemas.Tables.members)
      .where(eq(Schemas.Tables.members.archived, isArchived));

    return results.map((row) =>
      Member.from({
        id: row.id,
        userId: row.userId,
        displayName: row.displayName,
        archived: row.archived,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })
    );
  }

  // Additional methods specific to members
  async findByUserId(userId: string): Promise<Member[]> {
    const results = await this.dbClient
      .select()
      .from(Schemas.Tables.members)
      .where(eq(Schemas.Tables.members.userId, userId));

    return results.map((row) =>
      Member.from({
        id: row.id,
        userId: row.userId,
        displayName: row.displayName,
        archived: row.archived,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })
    );
  }

  async findAll(): Promise<Member[]> {
    const results = await this.dbClient
      .select()
      .from(Schemas.Tables.members)
      .orderBy(Schemas.Tables.members.createdAt);

    return results.map((row) =>
      Member.from({
        id: row.id,
        userId: row.userId,
        displayName: row.displayName,
        archived: row.archived,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })
    );
  }
}
