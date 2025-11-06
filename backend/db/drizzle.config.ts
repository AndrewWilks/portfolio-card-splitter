import { defineConfig } from "drizzle-kit";
import { config } from "../config.ts";

export default defineConfig({
  out: "./backend/db/migrations",
  schema: "./backend/db/db.schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: config.DATABASE_URL,
  },
});
