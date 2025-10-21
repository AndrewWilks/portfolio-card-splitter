// Routes
import { Context } from "hono";
import { validateBody } from "../middleware/validation.ts";
import { z } from "zod";
import {
  CreateMemberSchema,
  CreateMerchantSchema,
  CreatePaymentSchema,
  CreatePotSchema,
  CreateReservationSchema,
  CreateTagSchema,
  CreateTransactionSchema,
  CreateTransferSchema,
  QuerySchema,
  UpdateMemberSchema,
  UpdateMerchantSchema,
  UpdatePotSchema,
  UpdateTagSchema,
  UpdateTransactionSchema,
} from "../../shared/schemas/api/index.ts";
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
import {
  createAuditService,
  createAuthService,
  createLedgerService,
  createMemberService,
  createMerchantService,
  createPaymentService,
  createPotService,
  createReservationService,
  createTransactionService,
  createTransferService,
} from "./services.ts";
import { createEventRepository } from "./repositories.ts";

// Helper Functions for Route Factories
function createValidatedRoute(
  schema: z.ZodSchema,
  handler: (c: Context) => Response,
) {
  return validateBody(schema)(handler);
}

function createListRoute<T>(
  serviceFactory: () => T,
  handler: (c: Context, service: T) => Response | Promise<Response>,
) {
  const service = serviceFactory();
  return (c: Context) => {
    const query = QuerySchema.parse(c.req.query());
    c.set("query", query);
    return handler(c, service);
  };
}

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
  return createListRoute(createMemberService, apiPeopleList);
}

export function createApiPeopleCreate() {
  const memberService = createMemberService();
  return createValidatedRoute(
    CreateMemberSchema,
    (c: Context) => apiPeopleCreate(c, memberService),
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
  return createListRoute(createTransactionService, apiTransactionsList);
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
  return createListRoute(createMerchantService, apiMerchantsList);
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

// Tag Routes - require MerchantService
export function createApiTagsList() {
  return createListRoute(createMerchantService, apiTagsList);
}

export function createApiTagsCreate() {
  const merchantService = createMerchantService();
  return validateBody(CreateTagSchema)((c: Context) =>
    apiTagsCreate(c, merchantService)
  );
}

export function createApiTagsUpdate() {
  const merchantService = createMerchantService();
  return validateBody(UpdateTagSchema)((c: Context) =>
    apiTagsUpdate(c, merchantService)
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
