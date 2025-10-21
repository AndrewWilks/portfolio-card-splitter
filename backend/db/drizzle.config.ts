import { defineConfig } from "drizzle-kit";
import { config } from "../config.ts";

export default defineConfig({
  out: "shared/db/__migrations__",
  schema: "./shared/db/db.schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: config.DATABASE_URL,
  },
});
