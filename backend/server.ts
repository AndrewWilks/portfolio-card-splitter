import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import {
  createRootRoute,
  createApiAuthBootstrap,
  createApiAuthInvite,
  createApiAuthAcceptInvite,
  createApiAuthLogin,
  createApiAuthLogout,
  createApiAuthRequestReset,
  createApiAuthResetPassword,
  createApiPeopleList,
  createApiPeopleCreate,
  createApiPeopleUpdate,
  createApiTransactionsList,
  createApiTransactionsCreate,
  createApiTransactionsUpdate,
  createApiMerchantsList,
  createApiMerchantsCreate,
  createApiMerchantsUpdate,
  createApiTagsList,
  createApiTagsCreate,
  createApiTagsUpdate,
  createApiPotsList,
  createApiPotsCreate,
  createApiPotsUpdate,
  createApiPotsDeposit,
  createApiReservationsCreate,
  createApiReservationsDelete,
  createApiTransfersCreate,
  createApiPaymentsCreate,
  createApiLedgerGet,
  createApiAuditGet,
  createApiEventsStream,
} from "./di.ts";

const backend = new Hono();

export { backend };

// Logger Middleware
backend.use("*", logger());

// CORS Middleware
backend.use(
  "*",
  cors({
    origin:
      Deno.env.get("NODE_ENV") === "production"
        ? [Deno.env.get("APP_UR") || ""]
        : ["http://localhost:3000"],
    credentials: true,
  })
);

// Error Handling Middleware
backend.onError((err, c) => {
  console.error("Error occurred:", err);
  return c.json(
    { message: "Internal Server Error", details: err.message },
    500
  );
});

// Root route
backend.get("/", createRootRoute());

// Health check
backend.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    locale: "en-AU",
    timezone: "Australia/Brisbane",
  });
});

// API routes would be added here, e.g. backend.route("/api", apiRoutes);
backend.use("/api/*", (_c, next) => {
  // TODO: Add middleware logic here (e.g., authentication)
  console.log("API route accessed");
  return next();
});

backend.get("/api", (c) => c.text("Portfolio Card Splitter API Root"));
backend.get("/api/status", (c) => {
  return c.json({
    message: "Portfolio Card Splitter API",
    version: "0.1.0",
    status: "development",
  });
});

// Authentication Endpoints
backend.post("/api/auth/bootstrap", createApiAuthBootstrap());
backend.post("/api/auth/invite", createApiAuthInvite()); // TODO: Implement invite functionality
backend.post("/api/auth/accept-invite", createApiAuthAcceptInvite()); // TODO: Implement accept invite functionality
backend.post("/api/auth/login", createApiAuthLogin()); // TODO: Implement login functionality
backend.post("/api/auth/logout", createApiAuthLogout()); // TODO: Implement logout functionality
backend.post("/api/auth/request-reset", createApiAuthRequestReset()); // TODO: Implement password reset request
backend.post("/api/auth/reset", createApiAuthResetPassword()); // TODO: Implement password reset

// People Management Endpoints
backend.get("/api/people", createApiPeopleList()); // TODO: Implement people list endpoint
backend.post("/api/people", createApiPeopleCreate()); // TODO: Implement people create endpoint
backend.patch("/api/people/:id", createApiPeopleUpdate()); // TODO: Implement people update endpoint

// Transaction Management Endpoints
backend.get("/api/transactions", createApiTransactionsList()); // TODO: Implement transactions list endpoint
backend.post("/api/transactions", createApiTransactionsCreate()); // TODO: Implement transactions create endpoint
backend.patch("/api/transactions/:id", createApiTransactionsUpdate()); // TODO: Implement transactions update endpoint

// Merchant Management Endpoints
backend.get("/api/merchants", createApiMerchantsList()); // TODO: Implement merchants list endpoint
backend.post("/api/merchants", createApiMerchantsCreate()); // TODO: Implement merchants create endpoint
backend.patch("/api/merchants/:id", createApiMerchantsUpdate()); // TODO: Implement merchants update endpoint

// Tag Management Endpoints
backend.get("/api/tags", createApiTagsList()); // TODO: Implement tags list endpoint
backend.post("/api/tags", createApiTagsCreate()); // TODO: Implement tags create endpoint
backend.patch("/api/tags/:id", createApiTagsUpdate()); // TODO: Implement tags update endpoint

// Pot Management Endpoints
backend.get("/api/pots", createApiPotsList()); // TODO: Implement pots list endpoint
backend.post("/api/pots", createApiPotsCreate()); // TODO: Implement pots create endpoint
backend.patch("/api/pots/:id", createApiPotsUpdate()); // TODO: Implement pots update endpoint
backend.post("/api/pots/:id/deposit", createApiPotsDeposit()); // TODO: Implement pots deposit endpoint

// Reservation Management Endpoints
backend.post("/api/reservations", createApiReservationsCreate()); // TODO: Implement reservations create endpoint
backend.delete("/api/reservations/:id", createApiReservationsDelete()); // TODO: Implement reservations delete endpoint

// Transfer Management Endpoints
backend.post("/api/transfers", createApiTransfersCreate()); // TODO: Implement transfers create endpoint

// Payment Management Endpoints
backend.post("/api/payments", createApiPaymentsCreate()); // TODO: Implement payments create endpoint

// Ledger & Audit Endpoints
backend.get("/api/ledger", createApiLedgerGet()); // TODO: Implement ledger get endpoint
backend.get("/api/audit", createApiAuditGet()); // TODO: Implement audit get endpoint

// Real-Time Events Endpoint
backend.get("/api/events/stream", createApiEventsStream()); // TODO: Implement events stream endpoint

// Health Check Endpoint
backend.get("/api/health", (c) => c.json({ status: "ok" }));

Deno.serve(backend.fetch);
