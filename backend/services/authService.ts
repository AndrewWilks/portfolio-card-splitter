import {
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
    if (!validation.isValid) {
      throw new Error(
        `Password validation failed: ${validation.errors.join(", ")}`
      );
    }

    // Hash password
    const passwordHash = await this.passwordService.hash(data.password);

    // Create OWNER user
    const user = await this.userRepo.insert(
      User.create({
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: UserRole.OWNER,
      })
    );

    // Create session
    const session = await this.sessionService.create(user.id);

    // Emit event
    await this.eventRepo.insert({
      type: "created",
      actorUserId: user.id,
      entityType: "user",
      entityId: user.id,
      payload: { bootstrapped: true },
    });

    return { user, session };
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
    await this.eventRepo.insert({
      type: "login",
      actorUserId: user.id,
      entityType: "user",
      entityId: user.id,
      payload: {},
    });

    return { user, session };
  }

  async logout(sessionId: string): Promise<void> {
    // Find session to get user ID for event
    const session = await this.sessionRepo.findById(sessionId);

    if (session) {
      // Delete session
      await this.sessionService.delete(sessionId);

      // Emit logout event
      await this.eventRepo.insert({
        type: "logout",
        actorUserId: session.userId,
        entityType: "user",
        entityId: session.userId,
        payload: {},
      });
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
    const savedToken = await this.inviteTokenRepo.insert(token);

    // Emit event
    await this.eventRepo.insert({
      type: "created",
      actorUserId: inviterUserId,
      entityType: "invite_token",
      entityId: savedToken.id,
      payload: { email, role },
    });

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
    if (!validation.isValid) {
      throw new Error(
        `Password validation failed: ${validation.errors.join(", ")}`
      );
    }

    // Hash password
    const passwordHash = await this.passwordService.hash(data.password);

    // Create user
    const user = await this.userRepo.insert(
      User.create({
        email: token.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: token.role,
      })
    );

    // Mark token as used
    token.use();
    await this.inviteTokenRepo.update(token);

    // Create session
    const session = await this.sessionService.create(user.id);

    // Emit event
    await this.eventRepo.insert({
      type: "created",
      actorUserId: user.id,
      entityType: "user",
      entityId: user.id,
      payload: { inviteTokenId: tokenId },
    });

    return { user, session };
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
      id: "",
      userId: user.id,
      expirationHours: 1,
    });
    const savedToken = await this.passwordResetTokenRepo.insert(token);

    // Emit event
    await this.eventRepo.insert({
      type: "created",
      actorUserId: user.id,
      entityType: "password_reset_token",
      entityId: savedToken.id,
      payload: { userId: user.id },
    });

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
    if (!validation.isValid) {
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
    const updatedUser = User.create({
      ...user.toJSON,
      passwordHash,
    });
    await this.userRepo.update(updatedUser);

    // Mark token as used
    token.use();
    await this.passwordResetTokenRepo.update(token);

    // Invalidate all user sessions
    await this.sessionService.deleteAllForUser(user.id);

    // Emit event
    await this.eventRepo.insert({
      type: "password_reset",
      actorUserId: user.id,
      entityType: "user",
      entityId: user.id,
      payload: {},
    });
  }
}
