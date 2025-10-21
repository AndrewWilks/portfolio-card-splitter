import { z } from "zod";

const configSchema = z.object({
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3000),
});

export type Config = z.infer<typeof configSchema>;

export function loadConfig(): Config {
  const config = {
    DATABASE_URL: Deno.env.get("DATABASE_URL"),
    JWT_SECRET: Deno.env.get("JWT_SECRET"),
    NODE_ENV: Deno.env.get("NODE_ENV"),
    PORT: Deno.env.get("PORT"),
  };

  return configSchema.parse(config);
}

export const config = loadConfig();
