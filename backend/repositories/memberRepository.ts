import { Member } from "@shared/entities";
import { db } from "@db";
import { eq, and } from "drizzle-orm";
import { members, users } from "../db/db.schema.ts";

export class MemberRepository {
  constructor(private dbClient = db) {
    this.dbClient = dbClient;
  }

  async save(_member: Member) {
    const hasMember = await this.findById(_member.id);

    if (hasMember !== null) {
      return await this.dbClient
        .update(members)
        .set(_member)
        .where(eq(members.id, _member.id));
    }

    return await this.dbClient.insert(members).values(_member);
  }

  async findById(_id: string, _isActive?: boolean): Promise<Member | null> {
    const found = await this.dbClient
      .select()
      .from(members)
      .where(
        and(
          eq(members.id, _id),
          _isActive !== undefined ? eq(members.archived, !_isActive) : undefined
        )
      );

    if (found.length === 0) {
      return null;
    }

    if (found.length > 1) {
      throw new Error(`Multiple members found with id: ${_id}`);
    }

    return Member.create(found[0]);
  }

  async findByEmail(
    _email: string,
    _isActive?: boolean
  ): Promise<Member | null> {
    const found = await this.dbClient
      .select()
      .from(members)
      .innerJoin(users, eq(members.userId, users.id))
      .where(
        and(
          eq(users.email, _email),
          _isActive !== undefined ? eq(members.archived, !_isActive) : undefined
        )
      );

    if (found.length === 0) {
      return null;
    }

    if (found.length > 1) {
      throw new Error(`Multiple members found with email: ${_email}`);
    }

    return Member.create(found[0].members);
  }

  async findByStatus(_status: string): Promise<Member[]> {
    const isActive = _status === "active" ? true : false;

    const found = await this.dbClient
      .select()
      .from(members)
      .where(eq(members.archived, !isActive))
      .orderBy(members.createdAt);

    return found.map((row) => Member.create(row));
  }

  // Additional methods specific to members
  async findByUserId(userId: string): Promise<Member[]> {
    const found = await this.dbClient
      .select()
      .from(members)
      .where(eq(members.userId, userId));

    return found.map((row) => Member.create(row));
  }

  async findAll(): Promise<Member[]> {
    const found = await this.dbClient
      .select()
      .from(members)
      .orderBy(members.createdAt);

    return found.map((row) => Member.create(row));
  }

  async delete(_id: string) {
    return await this.dbClient.delete(members).where(eq(members.id, _id));
  }
}
