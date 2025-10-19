import { MiddlewareHandler, Context } from "hono";
import { z } from "zod";

export const validateBody = (schema: z.ZodSchema) => {
  return (handler: (c: Context) => Promise<Response> | Response) => {
    return async (c: Context) => {
      try {
        const body = await c.req.json();
        const validatedData = schema.parse(body);
        c.set("validatedBody", validatedData);
        return handler(c);
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
};
