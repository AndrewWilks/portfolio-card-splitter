/**
 * Retrieves the database connection URL from the environment variables.
 *
 * @throws {Error} If the `DATABASE_URL` environment variable is not set.
 * @returns {string} The database connection URL.
 */
function getDatabaseUrl(): string {
  const url = Deno.env.get("DATABASE_URL");

  if (!url) {
    throw new Error("DATABASE_URL is not set in environment variables.");
  }

  return url;
}

/**
 * The database connection URL used throughout the application.
 *
 * This constant is initialised by calling `getDatabaseUrl()`, which should
 * return a valid connection string for the database.
 *
 * @remarks
 * Ensure that `getDatabaseUrl()` is properly configured to return the correct
 * URL for your environment (development, staging, production, etc.).
 */
export const DB_URL = getDatabaseUrl();
