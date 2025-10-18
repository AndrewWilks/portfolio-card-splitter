import { pgEnum } from "drizzle-orm/pg-core";

/**
 * Postgres enum for `transaction_type`.
 *
 * Common transaction directions: 'expense' or 'income'.
 */
export const transactionType = pgEnum("transaction_type", [
  "expense",
  "income",
]);
