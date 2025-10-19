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
import { Context } from "hono";
import { rootRoute } from "@backend/routes";
import { apiAuthBootstrap } from "@backend/routes";
import { apiAuthInvite } from "@backend/routes";
import { apiAuthAcceptInvite } from "@backend/routes";
import { apiAuthLogin } from "@backend/routes";
import { apiAuthLogout } from "@backend/routes";
import { apiAuthRequestReset } from "@backend/routes";
import { apiAuthResetPassword } from "@backend/routes";
import { apiPeopleList } from "@backend/routes";
import { apiPeopleCreate } from "@backend/routes";
import { apiPeopleUpdate } from "@backend/routes";
import { apiTransactionsList } from "@backend/routes";
import { apiTransactionsCreate } from "@backend/routes";
import { apiTransactionsUpdate } from "@backend/routes";
import { apiMerchantsList } from "@backend/routes";
import { apiMerchantsCreate } from "@backend/routes";
import { apiMerchantsUpdate } from "@backend/routes";
import { apiTagsList } from "@backend/routes";
import { apiTagsCreate } from "@backend/routes";
import { apiTagsUpdate } from "@backend/routes";
import { apiPotsList } from "@backend/routes";
import { apiPotsCreate } from "@backend/routes";
import { apiPotsUpdate } from "@backend/routes";
import { apiPotsDeposit } from "@backend/routes";
import { apiReservationsCreate } from "@backend/routes";
import { apiReservationsDelete } from "@backend/routes";
import { apiTransfersCreate } from "@backend/routes";
import { apiPaymentsCreate } from "@backend/routes";
import { apiLedgerGet } from "@backend/routes";
import { apiAuditGet } from "@backend/routes";
import { apiEventsStream } from "@backend/routes";

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
  return (c: Context) => apiAuthBootstrap(c, authService);
}

// TODO: Wire DI for auth routes - requires AuthService
export function createApiAuthInvite() {
  // const authService = createAuthService();
  // return (c: any) => apiAuthInvite(c, authService);
  return apiAuthInvite;
}

export function createApiAuthAcceptInvite() {
  // TODO: Implement DI wiring for accept invite route
  return apiAuthAcceptInvite;
}

export function createApiAuthLogin() {
  // TODO: Implement DI wiring for login route
  return apiAuthLogin;
}

export function createApiAuthLogout() {
  // TODO: Implement DI wiring for logout route
  return apiAuthLogout;
}

export function createApiAuthRequestReset() {
  // TODO: Implement DI wiring for password reset request route
  return apiAuthRequestReset;
}

export function createApiAuthResetPassword() {
  // TODO: Implement DI wiring for password reset route
  return apiAuthResetPassword;
}

// TODO: Wire DI for people routes - requires MemberService
export function createApiPeopleList() {
  // const memberService = createMemberService();
  // return (c: any) => apiPeopleList(c, memberService);
  return apiPeopleList;
}

export function createApiPeopleCreate() {
  // TODO: Implement DI wiring for people create route
  return apiPeopleCreate;
}

export function createApiPeopleUpdate() {
  // TODO: Implement DI wiring for people update route
  return apiPeopleUpdate;
}

// TODO: Wire DI for transaction routes - requires TransactionService
export function createApiTransactionsList() {
  // const transactionService = createTransactionService();
  // return (c: any) => apiTransactionsList(c, transactionService);
  return apiTransactionsList;
}

export function createApiTransactionsCreate() {
  // TODO: Implement DI wiring for transactions create route
  return apiTransactionsCreate;
}

export function createApiTransactionsUpdate() {
  // TODO: Implement DI wiring for transactions update route
  return apiTransactionsUpdate;
}

// TODO: Wire DI for merchant routes - requires MerchantService
export function createApiMerchantsList() {
  // const merchantService = createMerchantService();
  // return (c: any) => apiMerchantsList(c, merchantService);
  return apiMerchantsList;
}

export function createApiMerchantsCreate() {
  // TODO: Implement DI wiring for merchants create route
  return apiMerchantsCreate;
}

export function createApiMerchantsUpdate() {
  // TODO: Implement DI wiring for merchants update route
  return apiMerchantsUpdate;
}

// TODO: Wire DI for tag routes - requires TagService (if exists) or direct repository
export function createApiTagsList() {
  // const tagRepository = createTagRepository();
  // return (c: any) => apiTagsList(c, tagRepository);
  return apiTagsList;
}

export function createApiTagsCreate() {
  // TODO: Implement DI wiring for tags create route
  return apiTagsCreate;
}

export function createApiTagsUpdate() {
  // TODO: Implement DI wiring for tags update route
  return apiTagsUpdate;
}

// TODO: Wire DI for pot routes - requires PotService
export function createApiPotsList() {
  // const potService = createPotService();
  // return (c: any) => apiPotsList(c, potService);
  return apiPotsList;
}

export function createApiPotsCreate() {
  // TODO: Implement DI wiring for pots create route
  return apiPotsCreate;
}

export function createApiPotsUpdate() {
  // TODO: Implement DI wiring for pots update route
  return apiPotsUpdate;
}

export function createApiPotsDeposit() {
  // TODO: Implement DI wiring for pots deposit route
  return apiPotsDeposit;
}

// TODO: Wire DI for reservation routes - requires ReservationService
export function createApiReservationsCreate() {
  // const reservationService = createReservationService();
  // return (c: any) => apiReservationsCreate(c, reservationService);
  return apiReservationsCreate;
}

export function createApiReservationsDelete() {
  // TODO: Implement DI wiring for reservations delete route
  return apiReservationsDelete;
}

// TODO: Wire DI for transfer routes - requires TransferService
export function createApiTransfersCreate() {
  // const transferService = createTransferService();
  // return (c: any) => apiTransfersCreate(c, transferService);
  return apiTransfersCreate;
}

// TODO: Wire DI for payment routes - requires PaymentService
export function createApiPaymentsCreate() {
  // const paymentService = createPaymentService();
  // return (c: any) => apiPaymentsCreate(c, paymentService);
  return apiPaymentsCreate;
}

// TODO: Wire DI for ledger routes - requires LedgerService
export function createApiLedgerGet() {
  // const ledgerService = createLedgerService();
  // return (c: any) => apiLedgerGet(c, ledgerService);
  return apiLedgerGet;
}

export function createApiAuditGet() {
  // TODO: Implement DI wiring for audit get route
  return apiAuditGet;
}

// TODO: Wire DI for events routes - requires EventService (if exists)
export function createApiEventsStream() {
  // const eventService = createEventService();
  // return (c: any) => apiEventsStream(c, eventService);
  return apiEventsStream;
}
