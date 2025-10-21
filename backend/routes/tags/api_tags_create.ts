import { Context } from "hono";
import { TagRepository } from "@backend/repositories";

export function apiTagsCreate(_c: Context, _tagRepository: TagRepository) {
  // TODO: Implement POST /api/tags endpoint to create a new tag
  // - Validate request body with CreateTagSchema
  // - Create tag using TagRepository
  // - Return tag response with success message
  return _c.json({ message: "Not implemented" }, 501);
}
