import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { authMiddleware } from "./middleware/auth.ts";
import {
  createApiAuditGet,
  createApiAuthAcceptInvite,
  createApiAuthBootstrap,
  createApiAuthInvite,
  createApiAuthLogin,
  createApiAuthLogout,
  createApiAuthRequestReset,
  createApiAuthResetPassword,
  createApiEventsStream,
  createApiLedgerGet,
  createApiMerchantsCreate,
  createApiMerchantsList,
  createApiMerchantsUpdate,
  createApiPaymentsCreate,
  createApiPeopleCreate,
  createApiPeopleList,
  createApiPeopleUpdate,
  createApiPotsCreate,
  createApiPotsDeposit,
  createApiPotsList,
  createApiPotsUpdate,
  createApiReservationsCreate,
  createApiReservationsDelete,
  createApiTagsCreate,
  createApiTagsList,
  createApiTagsUpdate,
  createApiTransactionsCreate,
  createApiTransactionsList,
  createApiTransactionsUpdate,
  createApiTransfersCreate,
  createRootRoute,
} from "./di/index.ts";
import { db } from "@db";

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
        ? [Deno.env.get("APP_URL") || ""]
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

// Apply authentication middleware to all API routes except auth endpoints
backend.use("/api/*", async (c, next) => {
  const path = c.req.path;
  // Skip auth middleware for auth endpoints and health/status endpoints
  if (
    path.startsWith("/api/auth/") ||
    path === "/api/health" ||
    path === "/api/status" ||
    path === "/api"
  ) {
    await next();
    return;
  }
  await authMiddleware(c, next);
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
backend.post("/api/auth/invite", createApiAuthInvite());
backend.post("/api/auth/accept-invite", createApiAuthAcceptInvite());
backend.post("/api/auth/login", createApiAuthLogin());
backend.post("/api/auth/logout", createApiAuthLogout());
backend.post("/api/auth/request-reset", createApiAuthRequestReset());
backend.post("/api/auth/reset", createApiAuthResetPassword());

// People Management Endpoints
backend.get("/api/people", createApiPeopleList());
backend.post("/api/people", createApiPeopleCreate());
backend.patch("/api/people/:id", createApiPeopleUpdate());

// Transaction Management Endpoints
backend.get("/api/transactions", createApiTransactionsList());
backend.post("/api/transactions", createApiTransactionsCreate());
backend.patch("/api/transactions/:id", createApiTransactionsUpdate());

// Merchant Management Endpoints
backend.get("/api/merchants", createApiMerchantsList());
backend.post("/api/merchants", createApiMerchantsCreate());
backend.patch("/api/merchants/:id", createApiMerchantsUpdate());

// Tag Management Endpoints
backend.get("/api/tags", createApiTagsList());
backend.post("/api/tags", createApiTagsCreate());
backend.patch("/api/tags/:id", createApiTagsUpdate());

// Pot Management Endpoints
backend.get("/api/pots", createApiPotsList());
backend.post("/api/pots", createApiPotsCreate());
backend.patch("/api/pots/:id", createApiPotsUpdate());
backend.post("/api/pots/:id/deposit", createApiPotsDeposit());

// Reservation Management Endpoints
backend.post("/api/reservations", createApiReservationsCreate());
backend.delete("/api/reservations/:id", createApiReservationsDelete());
// Transfer Management Endpoints
backend.post("/api/transfers", createApiTransfersCreate());

// Payment Management Endpoints
backend.post("/api/payments", createApiPaymentsCreate());

// Ledger & Audit Endpoints
backend.get("/api/ledger", createApiLedgerGet());
backend.get("/api/audit", createApiAuditGet());

// Real-Time Events Endpoint
backend.get("/api/events/stream", createApiEventsStream());

// Health Check Endpoint
backend.get("/api/health", (c) =>
  c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    locale: "en-AU",
    timezone: "Australia/Brisbane",
  })
);

const server = Deno.serve(backend.fetch);

Deno.addSignalListener("SIGINT", async () => {
  console.log("Shutting down server...");
  server.shutdown();
  await db.$client.end();
});
