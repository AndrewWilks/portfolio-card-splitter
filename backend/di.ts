// Repositories
import { UserRepository } from "@backend/repositories";
import { MemberRepository } from "@backend/repositories";
import { MerchantRepository } from "@backend/repositories";
import { TagRepository } from "@backend/repositories";
import { TransactionRepository } from "@backend/repositories";
import { PotRepository } from "@backend/repositories";
import { ReservationRepository } from "@backend/repositories";
import { TransferRepository } from "@backend/repositories";
import { PaymentRepository } from "@backend/repositories";
import { EventRepository } from "@backend/repositories";
import { InviteTokenRepository } from "@backend/repositories";
import { PasswordResetTokenRepository } from "@backend/repositories";
import { SessionRepository } from "@backend/repositories";

// Services
import { AuthService } from "@backend/services";
import { MemberService } from "@backend/services";
import { MerchantService } from "@backend/services";
import { TransactionService } from "@backend/services";
import { ReservationService } from "@backend/services";
import { TransferService } from "@backend/services";
import { PaymentService } from "@backend/services";
import { AuditService } from "@backend/services";
import { LedgerService } from "@backend/services";
import { PasswordService } from "@backend/services";
import { PotService } from "@backend/services";
import { SessionService } from "@backend/services";

// Routes
import { rootRoute } from "@backend/routes";
import { apiAuthBootstrap } from "@backend/routes";

// Repository Factories
export function createUserRepository() {
  return new UserRepository();
}

export function createMemberRepository() {
  return new MemberRepository();
}

export function createMerchantRepository() {
  return new MerchantRepository();
}

export function createTagRepository() {
  return new TagRepository();
}

export function createTransactionRepository() {
  return new TransactionRepository();
}

export function createPotRepository() {
  return new PotRepository();
}

export function createReservationRepository() {
  return new ReservationRepository();
}

export function createTransferRepository() {
  return new TransferRepository();
}

export function createPaymentRepository() {
  return new PaymentRepository();
}

export function createEventRepository() {
  return new EventRepository();
}

export function createInviteTokenRepository() {
  return new InviteTokenRepository();
}

export function createPasswordResetTokenRepository() {
  return new PasswordResetTokenRepository();
}

export function createSessionRepository() {
  return new SessionRepository();
}

// Service Factories
export function createAuthService() {
  return new AuthService(
    createUserRepository(),
    createSessionRepository(),
    createInviteTokenRepository(),
    createPasswordResetTokenRepository()
  );
}

export function createMemberService() {
  return new MemberService(createMemberRepository());
}

export function createMerchantService() {
  return new MerchantService(createMerchantRepository(), createTagRepository());
}

export function createTransactionService() {
  return new TransactionService(
    createTransactionRepository(),
    createMerchantRepository(),
    createTagRepository()
  );
}

export function createReservationService() {
  return new ReservationService(
    createReservationRepository(),
    createPotRepository()
  );
}

export function createTransferService() {
  return new TransferService(createTransferRepository(), createPotRepository());
}

export function createPaymentService() {
  return new PaymentService(
    createPaymentRepository(),
    createReservationRepository()
  );
}

export function createAuditService() {
  return new AuditService(createEventRepository());
}

export function createLedgerService() {
  return new LedgerService();
}

export function createPasswordService() {
  return new PasswordService();
}

export function createPotService() {
  return new PotService(createPotRepository());
}

export function createSessionService() {
  return SessionService;
}

// Route Factories
export function createRootRoute() {
  return rootRoute;
}

export function createApiAuthBootstrap() {
  const authService = createAuthService();
  return (c: any) => apiAuthBootstrap(c, authService);
}
