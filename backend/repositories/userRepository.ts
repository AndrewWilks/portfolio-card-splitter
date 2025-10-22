import { User, UserRoleType } from "@shared/entities";
import { db } from "@db";
import { users } from "../db/db.schema.ts";
import { and, eq } from "drizzle-orm";

export class UserRepository {
  constructor(private dbClient = db) {
    this.dbClient = dbClient;
  }

  async save(_user: User) {
    const hasUser = await this.findById(_user.id);

    if (hasUser !== null) {
      return this.dbClient
        .update(users)
        .set(_user)
        .where(eq(users.id, _user.id));
    }

    return this.dbClient.insert(users).values(_user);
  }

  async findById(_id: string, _isActive?: boolean): Promise<User | null> {
    const found = await this.dbClient
      .select()
      .from(users)
      .where(
        and(
          eq(users.id, _id),
          _isActive !== undefined ? eq(users.isActive, _isActive) : undefined
        )
      );

    if (found.length === 0) {
      return null;
    }

    if (found.length > 1) {
      throw new Error(`Multiple users found with id: ${_id}`);
    }

    return User.create(found[0]);
  }

  async findByEmail(_email: string, _isActive?: boolean): Promise<User | null> {
    const found = await this.dbClient
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, _email),
          _isActive !== undefined ? eq(users.isActive, _isActive) : undefined
        )
      );

    if (found.length === 0) {
      return null;
    }

    if (found.length > 1) {
      throw new Error(`Multiple users found with email: ${_email}`);
    }

    return User.create(found[0]);
  }

  async findByRole(_role: UserRoleType, _isActive?: boolean): Promise<User[]> {
    const found = await this.dbClient
      .select()
      .from(users)
      .where(
        and(
          eq(users.role, _role),
          _isActive !== undefined ? eq(users.isActive, _isActive) : undefined
        )
      );

    if (found.length === 0) {
      throw new Error(`No users found with role: ${_role}`);
    }

    return found.map((userData) => User.create(userData));
  }

  async findAll(): Promise<User[]> {
    const found = await this.dbClient.select().from(users);
    return found.map((userData) => User.create(userData));
  }

  async delete(_id: string): Promise<void> {
    await this.dbClient.delete(users).where(eq(users.id, _id));
  }
}
