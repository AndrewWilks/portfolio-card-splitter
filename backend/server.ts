import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import * as routes from "./routes/index.ts";
import { createRootRoute, createApiAuthBootstrap } from "./di.ts";

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
backend.post("/api/auth/invite", routes.apiAuthInvite); // TODO: Implement invite functionality
backend.post("/api/auth/accept-invite", routes.apiAuthAcceptInvite); // TODO: Implement accept invite functionality
backend.post("/api/auth/login", routes.apiAuthLogin); // TODO: Implement login functionality
backend.post("/api/auth/logout", routes.apiAuthLogout); // TODO: Implement logout functionality
backend.post("/api/auth/request-reset", routes.apiAuthRequestReset); // TODO: Implement password reset request
backend.post("/api/auth/reset", routes.apiAuthResetPassword); // TODO: Implement password reset

// People Management Endpoints
backend.get("/api/people", routes.apiPeopleList); // TODO: Implement people list endpoint
backend.post("/api/people", routes.apiPeopleCreate); // TODO: Implement people create endpoint
backend.patch("/api/people/:id", routes.apiPeopleUpdate); // TODO: Implement people update endpoint

// Transaction Management Endpoints
backend.get("/api/transactions", routes.apiTransactionsList); // TODO: Implement transactions list endpoint
backend.post("/api/transactions", routes.apiTransactionsCreate); // TODO: Implement transactions create endpoint
backend.patch("/api/transactions/:id", routes.apiTransactionsUpdate); // TODO: Implement transactions update endpoint

// Merchant Management Endpoints
backend.get("/api/merchants", routes.apiMerchantsList); // TODO: Implement merchants list endpoint
backend.post("/api/merchants", routes.apiMerchantsCreate); // TODO: Implement merchants create endpoint
backend.patch("/api/merchants/:id", routes.apiMerchantsUpdate); // TODO: Implement merchants update endpoint

// Tag Management Endpoints
backend.get("/api/tags", routes.apiTagsList); // TODO: Implement tags list endpoint
backend.post("/api/tags", routes.apiTagsCreate); // TODO: Implement tags create endpoint
backend.patch("/api/tags/:id", routes.apiTagsUpdate); // TODO: Implement tags update endpoint

// Pot Management Endpoints
backend.get("/api/pots", routes.apiPotsList); // TODO: Implement pots list endpoint
backend.post("/api/pots", routes.apiPotsCreate); // TODO: Implement pots create endpoint
backend.patch("/api/pots/:id", routes.apiPotsUpdate); // TODO: Implement pots update endpoint
backend.post("/api/pots/:id/deposit", routes.apiPotsDeposit); // TODO: Implement pots deposit endpoint

// Reservation Management Endpoints
backend.post("/api/reservations", routes.apiReservationsCreate); // TODO: Implement reservations create endpoint
backend.delete("/api/reservations/:id", routes.apiReservationsDelete); // TODO: Implement reservations delete endpoint

// Transfer Management Endpoints
backend.post("/api/transfers", routes.apiTransfersCreate); // TODO: Implement transfers create endpoint

// Payment Management Endpoints
backend.post("/api/payments", routes.apiPaymentsCreate); // TODO: Implement payments create endpoint

// Ledger & Audit Endpoints
backend.get("/api/ledger", routes.apiLedgerGet); // TODO: Implement ledger get endpoint
backend.get("/api/audit", routes.apiAuditGet); // TODO: Implement audit get endpoint

// Real-Time Events Endpoint
backend.get("/api/events/stream", routes.apiEventsStream); // TODO: Implement events stream endpoint

// Health Check Endpoint
backend.get("/api/health", (c) => c.json({ status: "ok" }));

Deno.serve(backend.fetch);
