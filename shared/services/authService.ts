import {
  InviteTokenRepository,
  PasswordResetTokenRepository,
  SessionRepository,
  UserRepository,
} from "@shared/repositories";
import {
  InviteToken,
  PasswordResetToken,
  Session,
  User,
  UserRole,
  type UserRoleType,
} from "@shared/entities";
import { PasswordService, SessionService } from "@shared/services";
import { crypto } from "@std/crypto";

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private sessionRepository: SessionRepository,
    private inviteTokenRepository?: InviteTokenRepository,
    private passwordResetTokenRepository?: PasswordResetTokenRepository,
  ) {}

  async bootstrap(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ user: User; session: Session }> {
    // Check if any admin users exist
    const existingAdmins = await this.userRepository.findByRole("admin");
    if (existingAdmins.length > 0) {
      throw new Error(
        "Admin user already exists. Bootstrap is only allowed once.",
      );
    }

    // Validate password strength
    const passwordValidation = PasswordService.validatePassword(data.password);

    if (!passwordValidation.success) {
      throw new Error(
        `Password validation failed: ${
          passwordValidation.error.issues
            .map((e) => e.message)
            .join(", ")
        }`,
      );
    }

    // Hash password
    const passwordHash = await PasswordService.hashPassword(data.password);

    // Create admin user
    const user = User.create({
      id: crypto.randomUUID(),
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: "admin",
      isActive: true,
    });

    // Save user
    await this.userRepository.save(user);

    // Create session
    const session = SessionService.create(user.id);
    await this.sessionRepository.save(session);

    return { user, session };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ user: User; session: Session }> {
    // Find user by email
    const user = await this.userRepository.findByEmail(
      email.toLowerCase().trim(),
    );
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error("Account is inactive");
    }

    // Verify password
    const isPasswordValid = PasswordService.verifyPassword(
      password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Create new session
    const session = SessionService.create(user.id);
    await this.sessionRepository.save(session);

    return { user, session };
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessionRepository.delete(sessionId);
  }

  async validateSession(
    sessionId: string,
  ): Promise<{ user: User; session: Session } | null> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session || !SessionService.isValid(session)) {
      return null;
    }

    const user = await this.userRepository.findById(session.userId);
    if (!user || !user.isActive) {
      return null;
    }

    return { user, session };
  }

  async invite(
    inviterUserId: string,
    email: string,
    role: UserRoleType = UserRole.USER,
  ): Promise<InviteToken> {
    if (!this.inviteTokenRepository) {
      throw new Error("Invite token repository not configured");
    }

    // Check if inviter is admin
    const inviter = await this.userRepository.findById(inviterUserId);
    if (!inviter || !inviter.isAdmin()) {
      throw new Error("Only admins can send invites");
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(
      email.toLowerCase().trim(),
    );
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Check for existing valid invite
    const existingInvites = await this.inviteTokenRepository.findByEmail(email);
    const validInvite = existingInvites.find((invite) => invite.isValid());
    if (validInvite) {
      throw new Error("An active invite already exists for this email");
    }

    // Create invite token
    const token = InviteToken.create({
      id: crypto.randomUUID(),
      email,
      role,
    });

    await this.inviteTokenRepository.save(token);

    return token;
  }

  async acceptInvite(
    tokenId: string,
    data: {
      password: string;
      firstName: string;
      lastName: string;
    },
  ): Promise<{ user: User; session: Session }> {
    if (!this.inviteTokenRepository) {
      throw new Error("Invite token repository not configured");
    }

    // Find and validate token
    const token = await this.inviteTokenRepository.findById(tokenId);
    if (!token || !token.isValid()) {
      throw new Error("Invalid or expired invite token");
    }

    // Validate password
    const passwordValidation = PasswordService.validatePassword(data.password);
    if (!passwordValidation.success) {
      throw new Error(
        `Password validation failed: ${
          passwordValidation.error.issues
            .map((e) => e.message)
            .join(", ")
        }`,
      );
    }

    // Hash password
    const passwordHash = await PasswordService.hashPassword(data.password);

    // Create user
    const user = User.create({
      id: crypto.randomUUID(),
      email: token.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: token.role,
      isActive: true,
    });

    await this.userRepository.save(user);

    // Mark token as used
    const usedToken = token.markUsed();
    await this.inviteTokenRepository.save(usedToken);

    // Create session
    const session = SessionService.create(user.id);
    await this.sessionRepository.save(session);

    return { user, session };
  }

  async requestPasswordReset(email: string): Promise<PasswordResetToken> {
    if (!this.passwordResetTokenRepository) {
      throw new Error("Password reset token repository not configured");
    }

    // Find user
    const user = await this.userRepository.findByEmail(
      email.toLowerCase().trim(),
    );
    if (!user || !user.isActive) {
      throw new Error("No active user found with this email");
    }

    // Check for existing valid reset token
    const existingTokens = await this.passwordResetTokenRepository.findByUserId(
      user.id,
    );
    const validToken = existingTokens.find((token) => token.isValid());
    if (validToken) {
      throw new Error("A password reset request is already active");
    }

    // Create reset token
    const token = PasswordResetToken.create({
      id: crypto.randomUUID(),
      userId: user.id,
    });

    await this.passwordResetTokenRepository.save(token);

    return token;
  }

  async resetPassword(
    tokenId: string,
    newPassword: string,
  ): Promise<{ user: User; session: Session }> {
    if (!this.passwordResetTokenRepository) {
      throw new Error("Password reset token repository not configured");
    }

    // Find and validate token
    const token = await this.passwordResetTokenRepository.findById(tokenId);
    if (!token || !token.isValid()) {
      throw new Error("Invalid or expired reset token");
    }

    // Validate new password
    const passwordValidation = PasswordService.validatePassword(newPassword);
    if (!passwordValidation.success) {
      throw new Error(
        `Password validation failed: ${
          passwordValidation.error.issues
            .map((e) => e.message)
            .join(", ")
        }`,
      );
    }

    // Hash new password
    const passwordHash = await PasswordService.hashPassword(newPassword);

    // Update user
    const user = await this.userRepository.findById(token.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = new User(
      user.id,
      user.email,
      passwordHash,
      user.firstName,
      user.lastName,
      user.role,
      user.isActive,
      user.createdAt,
      new Date(),
    );

    await this.userRepository.save(updatedUser);

    // Mark token as used
    const usedToken = token.markUsed();
    await this.passwordResetTokenRepository.save(usedToken);

    // Create session
    const session = SessionService.create(updatedUser.id);
    await this.sessionRepository.save(session);

    return { user: updatedUser, session };
  }
}
