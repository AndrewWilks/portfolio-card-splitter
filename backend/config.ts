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

let cachedConfig: Config | null = null;

export function loadConfig(): Config {
  if (cachedConfig) {
    return cachedConfig;
  }

  const nodeEnv = Deno.env.get("NODE_ENV") || "development";
  const isTest = nodeEnv === "test";

  const config = {
    DATABASE_URL: Deno.env.get("DATABASE_URL") ||
      (isTest ? "postgresql://test:test@localhost:5432/test" : undefined),
    JWT_SECRET: Deno.env.get("JWT_SECRET") ||
      (isTest
        ? "test-jwt-secret-key-that-is-at-least-32-characters-long"
        : undefined),
    NODE_ENV: nodeEnv,
    PORT: Deno.env.get("PORT"),
  };

  cachedConfig = configSchema.parse(config);
  return cachedConfig;
}

// Export a getter that loads config lazily
export const config: Config = new Proxy({} as Config, {
  get(_target, prop) {
    const realConfig = loadConfig();
    return realConfig[prop as keyof Config];
  },
});
