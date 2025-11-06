import { defineConfig } from "drizzle-kit";
import { config } from "../config.ts";

export default defineConfig({
  out: "./backend/db/__migrations__",
  schema: "./backend/db/db.schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: config.DATABASE_URL,
  },
});
