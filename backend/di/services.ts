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
import {
  createEventRepository,
  createInviteTokenRepository,
  createMemberRepository,
  createMerchantRepository,
  createPasswordResetTokenRepository,
  createPaymentRepository,
  createPotRepository,
  createReservationRepository,
  createSessionRepository,
  createTagRepository,
  createTransactionRepository,
  createTransferRepository,
  createUserRepository,
} from "./repositories.ts";

// Service Factories
export function createAuthService() {
  return new AuthService(
    createUserRepository(),
    createSessionRepository(),
    createInviteTokenRepository(),
    createPasswordResetTokenRepository(),
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
    createTagRepository(),
  );
}

export function createReservationService() {
  return new ReservationService(
    createReservationRepository(),
    createPotRepository(),
  );
}

export function createTransferService() {
  return new TransferService(createTransferRepository(), createPotRepository());
}

export function createPaymentService() {
  return new PaymentService(
    createPaymentRepository(),
    createReservationRepository(),
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
