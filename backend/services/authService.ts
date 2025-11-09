import {
  Event,
  InviteToken,
  PasswordResetToken,
  Session,
  User,
  UserRole,
} from "@shared/entities";
import {
  UserRepository,
  SessionRepository,
  InviteTokenRepository,
  PasswordResetTokenRepository,
  EventRepository,
} from "@backend/repositories";
import { PasswordService } from "./passwordService.ts";
import { SessionService } from "./sessionService.ts";

/**
 * AuthService - Handles user authentication, sessions, and invitations
 */
export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private sessionRepo: SessionRepository,
    private inviteTokenRepo: InviteTokenRepository,
    private passwordResetTokenRepo: PasswordResetTokenRepository,
    private eventRepo: EventRepository,
    private passwordService: PasswordService,
    private sessionService: SessionService
  ) {}

  async bootstrap(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ user: User; session: Session }> {
    // Check if any users exist
    const existingUsers = await this.userRepo.findAll();
    if (existingUsers && existingUsers.length > 0) {
      throw new Error(
        "Users already exist. Bootstrap can only be performed once."
      );
    }

    // Validate password strength
    const validation = this.passwordService.getStrengthValidation(
      data.password
    );
    if (!validation.valid) {
      throw new Error(
        `Password validation failed: ${validation.errors.join(", ")}`
      );
    }

    // Hash password
    const passwordHash = await this.passwordService.hash(data.password);

    // Create OWNER user
    const user = new User({
      id: crypto.randomUUID(),
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: UserRole.OWNER,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const [savedUser] = await this.userRepo.save(user);

    // Create session
    const session = await this.sessionService.create(savedUser.id);

    // Emit event
    const event = new Event({
      id: crypto.randomUUID(),
      type: Event.EventType.CREATED,
      actorUserId: savedUser.id,
      entityType: "user" as never, // Event enum needs updating
      entityId: savedUser.id,
      payload: { bootstrapped: true },
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    });
    await this.eventRepo.save(event);

    return { user: savedUser, session };
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: User; session: Session }> {
    // Find user by email (case-insensitive)
    const user = await this.userRepo.findByEmail(email, true);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Verify password
    const isValid = await this.passwordService.verify(
      password,
      user.passwordHash
    );
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    // Create session
    const session = await this.sessionService.create(user.id);

    // Emit login event
    const event = new Event({
      id: crypto.randomUUID(),
      type: Event.EventType.LOGIN,
      actorUserId: user.id,
      entityType: "user" as never,
      entityId: user.id,
      payload: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    });
    await this.eventRepo.save(event);

    return { user, session };
  }

  async logout(sessionId: string): Promise<void> {
    // Find session to get user ID for event
    const session = await this.sessionRepo.findById(sessionId);

    if (session) {
      // Delete session
      await this.sessionService.delete(sessionId);

      // Emit logout event
      const event = new Event({
        id: crypto.randomUUID(),
        type: Event.EventType.LOGOUT,
        actorUserId: session.userId,
        entityType: "user" as never,
        entityId: session.userId,
        payload: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      });
      await this.eventRepo.save(event);
    }
    // Silent if session doesn't exist
  }

  async validateSession(
    sessionId: string
  ): Promise<{ user: User; session: Session } | null> {
    // Find valid session
    const session = await this.sessionService.findValidSession(sessionId);
    if (!session) {
      return null;
    }

    // Find user
    const user = await this.userRepo.findById(session.userId);
    if (!user) {
      return null;
    }

    return { user, session };
  }

  async invite(
    inviterUserId: string,
    email: string,
    role: UserRole = UserRole.MEMBER
  ): Promise<InviteToken> {
    // Verify inviter is OWNER
    const inviter = await this.userRepo.findById(inviterUserId);
    if (!inviter || inviter.role !== UserRole.OWNER) {
      throw new Error("Only OWNER can invite users");
    }

    // Check if email already exists
    const existingUser = await this.userRepo.findByEmail(email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Create invite token
    const token = InviteToken.create({ email, role, expirationHours: 24 });
    const [savedToken] = await this.inviteTokenRepo.save(token);

    // Emit event
    const event = new Event({
      id: crypto.randomUUID(),
      type: Event.EventType.CREATED,
      actorUserId: inviterUserId,
      entityType: "invite_token" as never,
      entityId: savedToken.id,
      payload: { email, role },
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    });
    await this.eventRepo.save(event);

    return savedToken;
  }

  async acceptInvite(
    tokenId: string,
    data: { password: string; firstName: string; lastName: string }
  ): Promise<{ user: User; session: Session }> {
    // Find and validate token
    const token = await this.inviteTokenRepo.findById(tokenId);
    if (!token || !token.isValid()) {
      throw new Error("Invalid or expired invite token");
    }

    // Validate password strength
    const validation = this.passwordService.getStrengthValidation(
      data.password
    );
    if (!validation.valid) {
      throw new Error(
        `Password validation failed: ${validation.errors.join(", ")}`
      );
    }

    // Hash password
    const passwordHash = await this.passwordService.hash(data.password);

    // Create user
    const user = new User({
      id: crypto.randomUUID(),
      email: token.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: token.role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const [savedUser] = await this.userRepo.save(user);

    // Mark token as used
    token.use();
    await this.inviteTokenRepo.save(token);

    // Create session
    const session = await this.sessionService.create(savedUser.id);

    // Emit event
    const event = new Event({
      id: crypto.randomUUID(),
      type: Event.EventType.CREATED,
      actorUserId: savedUser.id,
      entityType: "user" as never,
      entityId: savedUser.id,
      payload: { inviteTokenId: tokenId },
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    });
    await this.eventRepo.save(event);

    return { user: savedUser, session };
  }

  async requestPasswordReset(
    email: string
  ): Promise<PasswordResetToken | null> {
    // Find user by email (case-insensitive)
    const user = await this.userRepo.findByEmail(email, true);

    // Silent failure for security - don't reveal if email exists
    if (!user) {
      return null;
    }

    // Create reset token
    const token = PasswordResetToken.create({
      id: crypto.randomUUID(),
      userId: user.id,
      expirationHours: 1,
    });
    const [savedToken] = await this.passwordResetTokenRepo.save(token);

    // Emit event
    const event = new Event({
      id: crypto.randomUUID(),
      type: Event.EventType.CREATED,
      actorUserId: user.id,
      entityType: "password_reset_token" as never,
      entityId: savedToken.id,
      payload: { userId: user.id },
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    });
    await this.eventRepo.save(event);

    return savedToken;
  }

  async resetPassword(tokenId: string, newPassword: string): Promise<void> {
    // Find and validate token
    const token = await this.passwordResetTokenRepo.findById(tokenId);
    if (!token || !token.isValid()) {
      throw new Error("Invalid or expired reset token");
    }

    // Validate password strength
    const validation = this.passwordService.getStrengthValidation(newPassword);
    if (!validation.valid) {
      throw new Error(
        `Password validation failed: ${validation.errors.join(", ")}`
      );
    }

    // Find user
    const user = await this.userRepo.findById(token.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Hash new password
    const passwordHash = await this.passwordService.hash(newPassword);

    // Update user password
    const updatedUser = new User({
      ...user.toJSON,
      passwordHash,
      updatedAt: new Date(),
    });
    await this.userRepo.save(updatedUser);

    // Mark token as used
    token.use();
    await this.passwordResetTokenRepo.save(token);

    // Invalidate all user sessions
    await this.sessionService.deleteAllForUser(user.id);

    // Emit event
    const event = new Event({
      id: crypto.randomUUID(),
      type: Event.EventType.PASSWORD_RESET,
      actorUserId: user.id,
      entityType: "user" as never,
      entityId: user.id,
      payload: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    });
    await this.eventRepo.save(event);
  }
}
