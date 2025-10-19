import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import * as routes from "./routes/index.ts";

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
backend.get("/", routes.rootRoute);

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
backend.post("/api/auth/bootstrap", routes.apiAuthBootstrap);
backend.post("/api/auth/invite", routes.apiAuthInvite);
backend.post("/api/auth/accept-invite", routes.apiAuthAcceptInvite);
backend.post("/api/auth/login", routes.apiAuthLogin);
backend.post("/api/auth/logout", routes.apiAuthLogout);
backend.post("/api/auth/request-reset", routes.apiAuthRequestReset);
backend.post("/api/auth/reset", routes.apiAuthResetPassword);

// People Management Endpoints
backend.get("/api/people", routes.apiPeopleList);
backend.post("/api/people", routes.apiPeopleCreate);
backend.patch("/api/people/:id", routes.apiPeopleUpdate);

// Transaction Management Endpoints
backend.get("/api/transactions", routes.apiTransactionsList);
backend.post("/api/transactions", routes.apiTransactionsCreate);
backend.patch("/api/transactions/:id", routes.apiTransactionsUpdate);

// Merchant Management Endpoints
backend.get("/api/merchants", routes.apiMerchantsList);
backend.post("/api/merchants", routes.apiMerchantsCreate);
backend.patch("/api/merchants/:id", routes.apiMerchantsUpdate);

// Tag Management Endpoints
backend.get("/api/tags", routes.apiTagsList);
backend.post("/api/tags", routes.apiTagsCreate);
backend.patch("/api/tags/:id", routes.apiTagsUpdate);

// Pot Management Endpoints
backend.get("/api/pots", routes.apiPotsList);
backend.post("/api/pots", routes.apiPotsCreate);
backend.patch("/api/pots/:id", routes.apiPotsUpdate);
backend.post("/api/pots/:id/deposit", routes.apiPotsDeposit);

// Reservation Management Endpoints
backend.post("/api/reservations", routes.apiReservationsCreate);
backend.delete("/api/reservations/:id", routes.apiReservationsDelete);

// Transfer Management Endpoints
backend.post("/api/transfers", routes.apiTransfersCreate);

// Payment Management Endpoints
backend.post("/api/payments", routes.apiPaymentsCreate);

// Ledger & Audit Endpoints
backend.get("/api/ledger", routes.apiLedgerGet);
backend.get("/api/audit", routes.apiAuditGet);

// Real-Time Events Endpoint
backend.get("/api/events/stream", routes.apiEventsStream);

// Health Check Endpoint
backend.get("/api/health", (c) => c.json({ status: "ok" }));

Deno.serve(backend.fetch);
