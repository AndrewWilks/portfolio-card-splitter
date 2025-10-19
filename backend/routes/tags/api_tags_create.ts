import { Context } from "hono";

export function apiTagsCreate(c: Context) {
  // TODO: Implement POST /api/tags endpoint to create a new tag
  // - Validate request body with CreateTagSchema
  // - Create tag using TagService
  // - Return tag response with success message
  return c.json({ message: "Not implemented" }, 501);
}
