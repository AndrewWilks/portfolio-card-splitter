import { User } from "@shared/entities";
import { UserRepository } from "@backend/repositories";

export class UserService {
  constructor(private userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async createUser(request: unknown): Promise<User> {
    const CreateUserRequestSchema = User.createSchema;

    const parsed = CreateUserRequestSchema.safeParse(request);

    if (!parsed.success) {
      throw parsed.error;
    }

    const user = User.create({
      id: crypto.randomUUID(),
      ...parsed.data,
    });

    await this.userRepository.save(user);
    return user;
  }

  // List all users
  async listUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  // Get a single user by ID
  async getUserById(id: string): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  // Update an existing user
  async updateUser(id: string, request: unknown): Promise<User | null> {
    const UpdateUserRequestSchema = User.createSchema;

    const parsed = UpdateUserRequestSchema.safeParse(request);

    if (!parsed.success) {
      throw parsed.error;
    }

    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    await this.userRepository.save(user);
    return user;
  }

  // Delete a user
  async deleteUser(id: string): Promise<boolean> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    await this.userRepository.delete(id);
    return true;
  }
}
