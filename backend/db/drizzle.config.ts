import { defineConfig } from "drizzle-kit";
import { DB_URL } from "./constant/DB_URL.ts";

export default defineConfig({
  out: "shared/db/__migrations__",
  schema: "./shared/db/db.schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: DB_URL,
  },
});
