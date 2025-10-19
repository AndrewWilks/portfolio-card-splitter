import { MiddlewareHandler } from "hono";
import { z } from "zod";

export const validationMiddleware = (
  schema: z.ZodSchema
): MiddlewareHandler => {
  return async (c, next) => {
    try {
      const body = await c.req.json();
      const validatedData = schema.parse(body);
      c.set("validatedBody", validatedData);
      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json(
          { error: "Validation failed", details: error.issues },
          400
        );
      }
      return c.json({ error: "Invalid JSON" }, 400);
    }
  };
};
