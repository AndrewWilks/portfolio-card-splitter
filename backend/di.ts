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
import { z } from "zod";
import { validateBody } from "./middleware/validation.ts";
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

// Validation Schemas
const CreateMemberSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

const UpdateMemberSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
});

const CreateTransactionSchema = z.object({
  amount: z.number().int().positive(),
  description: z.string().min(1),
  merchantId: z.string().uuid().optional(),
  tags: z.array(z.string().uuid()).optional(),
});

const UpdateTransactionSchema = z.object({
  description: z.string().min(1).optional(),
  tags: z.array(z.string().uuid()).optional(),
});

const CreateMerchantSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1).optional(),
});

const UpdateMerchantSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
});

const CreateTagSchema = z.object({
  name: z.string().min(1),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

const UpdateTagSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

const CreatePotSchema = z.object({
  name: z.string().min(1),
  targetAmount: z.number().int().positive().optional(),
});

const UpdatePotSchema = z.object({
  name: z.string().min(1).optional(),
  targetAmount: z.number().int().positive().optional(),
});

const CreateReservationSchema = z.object({
  amount: z.number().int().positive(),
  description: z.string().min(1),
});

const CreateTransferSchema = z.object({
  fromPotId: z.string().uuid(),
  toPotId: z.string().uuid(),
  amount: z.number().int().positive(),
  description: z.string().min(1),
});

const CreatePaymentSchema = z.object({
  reservationId: z.string().uuid(),
  amount: z.number().int().positive(),
});

const QuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

// Route Factories
export function createRootRoute() {
  return rootRoute;
}

export function createApiAuthBootstrap() {
  const authService = createAuthService();
  return (c: Context) => apiAuthBootstrap(c, authService);
}

// Auth Routes - require AuthService for business logic
export function createApiAuthInvite() {
  const authService = createAuthService();
  return (c: Context) => apiAuthInvite(c, authService);
}

export function createApiAuthAcceptInvite() {
  const authService = createAuthService();
  return (c: Context) => apiAuthAcceptInvite(c, authService);
}

export function createApiAuthLogin() {
  const authService = createAuthService();
  return (c: Context) => apiAuthLogin(c, authService);
}

export function createApiAuthLogout() {
  const authService = createAuthService();
  return (c: Context) => apiAuthLogout(c, authService);
}

export function createApiAuthRequestReset() {
  const authService = createAuthService();
  return (c: Context) => apiAuthRequestReset(c, authService);
}

export function createApiAuthResetPassword() {
  const authService = createAuthService();
  return (c: Context) => apiAuthResetPassword(c, authService);
}

// People Routes - require MemberService
export function createApiPeopleList() {
  const memberService = createMemberService();
  return (c: Context) => {
    const query = QuerySchema.parse(c.req.query());
    c.set("query", query);
    return apiPeopleList(c, memberService);
  };
}

export function createApiPeopleCreate() {
  const memberService = createMemberService();
  return validateBody(CreateMemberSchema)((c: Context) =>
    apiPeopleCreate(c, memberService)
  );
}

export function createApiPeopleUpdate() {
  const memberService = createMemberService();
  return validateBody(UpdateMemberSchema)((c: Context) =>
    apiPeopleUpdate(c, memberService)
  );
}

// Transaction Routes - require TransactionService
export function createApiTransactionsList() {
  const transactionService = createTransactionService();
  return (c: Context) => {
    const query = QuerySchema.parse(c.req.query());
    c.set("query", query);
    return apiTransactionsList(c, transactionService);
  };
}

export function createApiTransactionsCreate() {
  const transactionService = createTransactionService();
  return validateBody(CreateTransactionSchema)((c: Context) =>
    apiTransactionsCreate(c, transactionService)
  );
}

export function createApiTransactionsUpdate() {
  const transactionService = createTransactionService();
  return validateBody(UpdateTransactionSchema)((c: Context) =>
    apiTransactionsUpdate(c, transactionService)
  );
}

// Merchant Routes - require MerchantService
export function createApiMerchantsList() {
  const merchantService = createMerchantService();
  return (c: Context) => {
    const query = QuerySchema.parse(c.req.query());
    c.set("query", query);
    return apiMerchantsList(c, merchantService);
  };
}

export function createApiMerchantsCreate() {
  const merchantService = createMerchantService();
  return validateBody(CreateMerchantSchema)((c: Context) =>
    apiMerchantsCreate(c, merchantService)
  );
}

export function createApiMerchantsUpdate() {
  const merchantService = createMerchantService();
  return validateBody(UpdateMerchantSchema)((c: Context) =>
    apiMerchantsUpdate(c, merchantService)
  );
}

// Tag Routes - require TagRepository
export function createApiTagsList() {
  const tagRepository = createTagRepository();
  return (c: Context) => {
    const query = QuerySchema.parse(c.req.query());
    c.set("query", query);
    return apiTagsList(c, tagRepository);
  };
}

export function createApiTagsCreate() {
  const tagRepository = createTagRepository();
  return validateBody(CreateTagSchema)((c: Context) =>
    apiTagsCreate(c, tagRepository)
  );
}

export function createApiTagsUpdate() {
  const tagRepository = createTagRepository();
  return validateBody(UpdateTagSchema)((c: Context) =>
    apiTagsUpdate(c, tagRepository)
  );
}

// Pot Routes - require PotService
export function createApiPotsList() {
  const potService = createPotService();
  return (c: Context) => {
    const query = QuerySchema.parse(c.req.query());
    c.set("query", query);
    return apiPotsList(c, potService);
  };
}

export function createApiPotsCreate() {
  const potService = createPotService();
  return validateBody(CreatePotSchema)((c: Context) =>
    apiPotsCreate(c, potService)
  );
}

export function createApiPotsUpdate() {
  const potService = createPotService();
  return validateBody(UpdatePotSchema)((c: Context) =>
    apiPotsUpdate(c, potService)
  );
}

export function createApiPotsDeposit() {
  const potService = createPotService();
  return (c: Context) => apiPotsDeposit(c, potService);
}

// Reservation Routes - require ReservationService
export function createApiReservationsCreate() {
  const reservationService = createReservationService();
  return validateBody(CreateReservationSchema)((c: Context) =>
    apiReservationsCreate(c, reservationService)
  );
}

export function createApiReservationsDelete() {
  const reservationService = createReservationService();
  return (c: Context) => apiReservationsDelete(c, reservationService);
}

// Transfer Routes - require TransferService
export function createApiTransfersCreate() {
  const transferService = createTransferService();
  return validateBody(CreateTransferSchema)((c: Context) =>
    apiTransfersCreate(c, transferService)
  );
}

// Payment Routes - require PaymentService
export function createApiPaymentsCreate() {
  const paymentService = createPaymentService();
  return validateBody(CreatePaymentSchema)((c: Context) =>
    apiPaymentsCreate(c, paymentService)
  );
}

// Ledger Routes - require LedgerService and AuditService
export function createApiLedgerGet() {
  const ledgerService = createLedgerService();
  return (c: Context) => apiLedgerGet(c, ledgerService);
}

export function createApiAuditGet() {
  const auditService = createAuditService();
  return (c: Context) => apiAuditGet(c, auditService);
}

// Events Routes - require EventRepository
export function createApiEventsStream() {
  const eventRepository = createEventRepository();
  return (c: Context) => apiEventsStream(c, eventRepository);
}
