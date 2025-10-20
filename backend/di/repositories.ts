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
