import { Context } from "hono";

export function rootRoute(c: Context): Response {
  return c.text("Hello Hono!");
}
