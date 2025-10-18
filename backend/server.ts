import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import * as routes from "./routes/index.ts";

const backend = new Hono();

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
backend.use("/api/*", async (c, next) => {
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

Deno.serve(backend.fetch);
