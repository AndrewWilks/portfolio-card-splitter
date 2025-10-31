// Routes
import { Context } from "hono";
import { z } from "zod";

import { validateBody } from "../middleware/validation.ts";
import { createEventRepository } from "./repositories.ts";

import * as schemas from "@shared/schemas/api";
import * as routes from "@backend/routes";
import * as services from "./services.ts";
import { User } from "@shared/entities";

// Helper Functions for Route Factories
function createValidatedRoute(
  schema: z.ZodSchema,
  handler: (c: Context) => Response | Promise<Response>
) {
  return validateBody(schema)(handler);
}

function createListRoute<T>(
  serviceFactory: () => T,
  handler: (c: Context, service: T) => Response | Promise<Response>
) {
  const service = serviceFactory();
  return (c: Context) => {
    const query = schemas.QuerySchema.parse(c.req.query());
    c.set("query", query);
    return handler(c, service);
  };
}

// Route Factories
export function createRootRoute() {
  return routes.rootRoute;
}

export function createApiAuthBootstrap() {
  const authService = services.createAuthService();
  return (c: Context) => routes.apiAuthBootstrap(c, authService);
}

// Auth Routes - require AuthService for business logic
export function createApiAuthInvite() {
  const authService = services.createAuthService();
  return (c: Context) => routes.apiAuthInvite(c, authService);
}

export function createApiAuthAcceptInvite() {
  const authService = services.createAuthService();
  return (c: Context) => routes.apiAuthAcceptInvite(c, authService);
}

export function createApiAuthLogin() {
  const authService = services.createAuthService();
  return (c: Context) => routes.apiAuthLogin(c, authService);
}

export function createApiAuthLogout() {
  const authService = services.createAuthService();
  return (c: Context) => routes.apiAuthLogout(c, authService);
}

export function createApiAuthRequestReset() {
  const authService = services.createAuthService();
  return (c: Context) => routes.apiAuthRequestReset(c, authService);
}

export function createApiAuthResetPassword() {
  const authService = services.createAuthService();
  return (c: Context) => routes.apiAuthResetPassword(c, authService);
}

// Member Routes - require MemberService
export function createApiMemberList() {
  return createListRoute(services.createMemberService, routes.apiMemberList);
}

export function createApiMemberCreate() {
  const memberService = services.createMemberService();
  return createValidatedRoute(schemas.CreateMemberSchema, (c: Context) =>
    routes.apiMemberCreate(c, memberService)
  );
}

export function createApiMemberUpdate() {
  const memberService = services.createMemberService();
  return validateBody(schemas.UpdateMemberSchema)((c: Context) =>
    routes.apiMemberUpdate(c, memberService)
  );
}

// User Routes - require UserService
export function createApiUserList() {
  return createListRoute(services.createUserService, routes.apiUserList);
}

export function createApiUserGet() {
  const userService = services.createUserService();
  return (c: Context) => {
    const params = User.urlParamsSchema.parse(c.req.param());
    return routes.apiUserGet(c, userService, params);
  };
}

export function createApiUserCreate() {
  const userService = services.createUserService();
  return createValidatedRoute(User.createSchema, (c: Context) =>
    routes.apiUserCreate(c, userService)
  );
}

export function createApiUserUpdate() {
  const userService = services.createUserService();
  return validateBody(User.updateSchema)((c: Context) =>
    routes.apiUserUpdate(c, userService)
  );
}

export function createApiUserDelete() {
  const userService = services.createUserService();
  return (c: Context) => {
    const params = User.urlParamsSchema.parse(c.req.param());
    return routes.apiUserDelete(c, userService, params);
  };
}

// Transaction Routes - require TransactionService
export function createApiTransactionsList() {
  return createListRoute(
    services.createTransactionService,
    routes.apiTransactionsList
  );
}

export function createApiTransactionsCreate() {
  const transactionService = services.createTransactionService();
  return validateBody(schemas.CreateTransactionSchema)((c: Context) =>
    routes.apiTransactionsCreate(c, transactionService)
  );
}

export function createApiTransactionsUpdate() {
  const transactionService = services.createTransactionService();
  return validateBody(schemas.UpdateTransactionSchema)((c: Context) =>
    routes.apiTransactionsUpdate(c, transactionService)
  );
}

// Merchant Routes - require MerchantService
export function createApiMerchantsList() {
  return createListRoute(
    services.createMerchantService,
    routes.apiMerchantsList
  );
}

export function createApiMerchantsCreate() {
  const merchantService = services.createMerchantService();
  return validateBody(schemas.CreateMerchantSchema)((c: Context) =>
    routes.apiMerchantsCreate(c, merchantService)
  );
}

export function createApiMerchantsUpdate() {
  const merchantService = services.createMerchantService();
  return validateBody(schemas.UpdateMerchantSchema)((c: Context) =>
    routes.apiMerchantsUpdate(c, merchantService)
  );
}

// Tag Routes - require MerchantService
export function createApiTagsList() {
  return createListRoute(services.createMerchantService, routes.apiTagsList);
}

export function createApiTagsCreate() {
  const merchantService = services.createMerchantService();
  return validateBody(schemas.CreateTagSchema)((c: Context) =>
    routes.apiTagsCreate(c, merchantService)
  );
}

export function createApiTagsUpdate() {
  const merchantService = services.createMerchantService();
  return validateBody(schemas.UpdateTagSchema)((c: Context) =>
    routes.apiTagsUpdate(c, merchantService)
  );
}

// Pot Routes - require PotService
export function createApiPotsList() {
  const potService = services.createPotService();
  return (c: Context) => {
    const query = schemas.QuerySchema.parse(c.req.query());
    c.set("query", query);
    return routes.apiPotsList(c, potService);
  };
}

export function createApiPotsCreate() {
  const potService = services.createPotService();
  return validateBody(schemas.CreatePotSchema)((c: Context) =>
    routes.apiPotsCreate(c, potService)
  );
}

export function createApiPotsUpdate() {
  const potService = services.createPotService();
  return validateBody(schemas.UpdatePotSchema)((c: Context) =>
    routes.apiPotsUpdate(c, potService)
  );
}

export function createApiPotsDeposit() {
  const potService = services.createPotService();
  return (c: Context) => routes.apiPotsDeposit(c, potService);
}

// Reservation Routes - require ReservationService
export function createApiReservationsCreate() {
  const reservationService = services.createReservationService();
  return validateBody(schemas.CreateReservationSchema)((c: Context) =>
    routes.apiReservationsCreate(c, reservationService)
  );
}

export function createApiReservationsDelete() {
  const reservationService = services.createReservationService();
  return (c: Context) => routes.apiReservationsDelete(c, reservationService);
}

// Transfer Routes - require TransferService
export function createApiTransfersCreate() {
  const transferService = services.createTransferService();
  return validateBody(schemas.CreateTransferSchema)((c: Context) =>
    routes.apiTransfersCreate(c, transferService)
  );
}

// Payment Routes - require PaymentService
export function createApiPaymentsCreate() {
  const paymentService = services.createPaymentService();
  return validateBody(schemas.CreatePaymentSchema)((c: Context) =>
    routes.apiPaymentsCreate(c, paymentService)
  );
}

// Ledger Routes - require LedgerService and AuditService
export function createApiLedgerGet() {
  const ledgerService = services.createLedgerService();
  return (c: Context) => routes.apiLedgerGet(c, ledgerService);
}

export function createApiAuditGet() {
  const auditService = services.createAuditService();
  return (c: Context) => routes.apiAuditGet(c, auditService);
}

// Events Routes - require EventRepository
export function createApiEventsStream() {
  const eventRepository = createEventRepository();
  return (c: Context) => routes.apiEventsStream(c, eventRepository);
}
