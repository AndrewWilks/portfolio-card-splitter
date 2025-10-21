import { UserRepository as SharedUserRepository } from "@shared/repositories";
import { User } from "@shared/entities";
import { db } from "@db";

export class UserRepository extends SharedUserRepository {
  constructor(private dbClient = db) {
    super();
  }

  override save(_user: User): Promise<void> {
    // TODO: Implement save method to insert user into database
    return Promise.reject("Not implemented");
  }

  override findById(_id: string): Promise<User | null> {
    // TODO: Implement findById method to query user by ID from database
    return Promise.reject("Not implemented");
  }

  override findByEmail(_email: string): Promise<User | null> {
    // TODO: Implement findByEmail method to query user by email from database
    return Promise.reject("Not implemented");
  }

  override findByRole(_role: string): Promise<User[]> {
    // TODO: Implement findByRole method to query users by role from database
    return Promise.reject("Not implemented");
  }
}
