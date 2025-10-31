import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { authMiddleware } from "./middleware/auth.ts";
import * as di from "@backend/di";
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
backend.get("/", di.createRootRoute());

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
backend.post("/api/auth/bootstrap", di.createApiAuthBootstrap());
backend.post("/api/auth/invite", di.createApiAuthInvite());
backend.post("/api/auth/accept-invite", di.createApiAuthAcceptInvite());
backend.post("/api/auth/login", di.createApiAuthLogin());
backend.post("/api/auth/logout", di.createApiAuthLogout());
backend.post("/api/auth/request-reset", di.createApiAuthRequestReset());
backend.post("/api/auth/reset", di.createApiAuthResetPassword());

// People Management Endpoints
backend.get("/api/member", di.createApiMemberList());
backend.post("/api/member", di.createApiMemberCreate());
backend.patch("/api/member/:id", di.createApiMemberUpdate());

// User Management Endpoints
backend.get("/api/users", di.createApiUserList());
backend.get("/api/users/:id", di.createApiUserGet());
backend.post("/api/users", di.createApiUserCreate());
backend.patch("/api/users/:id", di.createApiUserUpdate());
backend.delete("/api/users/:id", di.createApiUserDelete());

// Transaction Management Endpoints
backend.get("/api/transactions", di.createApiTransactionsList());
backend.post("/api/transactions", di.createApiTransactionsCreate());
backend.patch("/api/transactions/:id", di.createApiTransactionsUpdate());

// Merchant Management Endpoints
backend.get("/api/merchants", di.createApiMerchantsList());
backend.post("/api/merchants", di.createApiMerchantsCreate());
backend.patch("/api/merchants/:id", di.createApiMerchantsUpdate());

// Tag Management Endpoints
backend.get("/api/tags", di.createApiTagsList());
backend.post("/api/tags", di.createApiTagsCreate());
backend.patch("/api/tags/:id", di.createApiTagsUpdate());

// Pot Management Endpoints
backend.get("/api/pots", di.createApiPotsList());
backend.post("/api/pots", di.createApiPotsCreate());
backend.patch("/api/pots/:id", di.createApiPotsUpdate());
backend.post("/api/pots/:id/deposit", di.createApiPotsDeposit());

// Reservation Management Endpoints
backend.post("/api/reservations", di.createApiReservationsCreate());
backend.delete("/api/reservations/:id", di.createApiReservationsDelete());
// Transfer Management Endpoints
backend.post("/api/transfers", di.createApiTransfersCreate());

// Payment Management Endpoints
backend.post("/api/payments", di.createApiPaymentsCreate());

// Ledger & Audit Endpoints
backend.get("/api/ledger", di.createApiLedgerGet());
backend.get("/api/audit", di.createApiAuditGet());

// Real-Time Events Endpoint
backend.get("/api/events/stream", di.createApiEventsStream());

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
