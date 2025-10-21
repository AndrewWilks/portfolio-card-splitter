import { Context } from "hono";

export function rootRoute(c: Context): Response {
  return c.text(
    `Welcome to the Portfolio Card Splitter Backend API!\n\nyou have reached the (${c.req.path}) endpoint.\n\nAvailable routes will be documented here soon.`,
  );
}
