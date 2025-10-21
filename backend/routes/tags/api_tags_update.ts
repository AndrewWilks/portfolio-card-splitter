import { Context } from "hono";
import { TagRepository } from "@backend/repositories";

export function apiTagsUpdate(_c: Context, _tagRepository: TagRepository) {
  // TODO: Implement PATCH /api/tags/:id endpoint to update a tag
  // - Extract id from params
  // - Validate request body with UpdateTagSchema
  // - Update tag using TagRepository
  // - Return tag response with success message
  return _c.json({ message: "Not implemented" }, 501);
}
