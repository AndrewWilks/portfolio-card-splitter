// Services
import * as services from "@backend/services";
import * as repositories from "./repositories.ts";
import { createSessionRepository } from "@backend/di";

// Service Factories
export function createAuthService() {
  // return new services.AuthService(
  //   repositories.createUserRepository(),
  //   repositories.createSessionRepository(),
  //   repositories.createInviteTokenRepository(),
  //   repositories.createPasswordResetTokenRepository()
  // );
}

export function createMemberService() {
  return new services.MemberService(repositories.createMemberRepository());
}

export function createUserService() {
  return new services.UserService(repositories.createUserRepository());
}

export function createMerchantService() {
  return new services.MerchantService(
    repositories.createMerchantRepository(),
    repositories.createTagRepository()
  );
}

export function createTransactionService() {
  return new services.TransactionService(
    repositories.createTransactionRepository(),
    repositories.createMerchantRepository(),
    repositories.createTagRepository()
  );
}

export function createReservationService() {
  return new services.ReservationService(
    repositories.createReservationRepository(),
    repositories.createPotRepository()
  );
}

export function createTransferService() {
  return new services.TransferService(
    repositories.createTransferRepository(),
    repositories.createPotRepository()
  );
}

export function createPaymentService() {
  return new services.PaymentService(
    repositories.createPaymentRepository(),
    repositories.createReservationRepository()
  );
}

export function createAuditService() {
  return new services.AuditService(repositories.createEventRepository());
}

export function createLedgerService() {
  return new services.LedgerService();
}

export function createPasswordService() {
  return new services.PasswordService();
}

export function createPotService() {
  return new services.PotService(repositories.createPotRepository());
}

export function createSessionService() {
  // return new services.SessionService(createSessionRepository());
}
