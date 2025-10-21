import { User } from "../entities/user.ts";

interface I_UserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByRole(role: string): Promise<User[]>;
}

export class UserRepository implements I_UserRepository {
  save(_user: User): Promise<void> {
    return Promise.reject("Not implemented");
  }
  findById(_id: string): Promise<User | null> {
    return Promise.reject("Not implemented");
  }
  findByEmail(_email: string): Promise<User | null> {
    return Promise.reject("Not implemented");
  }
  findByRole(_role: string): Promise<User[]> {
    return Promise.reject("Not implemented");
  }
}
