import { Context } from "hono";
import { TagRepository } from "@backend/repositories";

export function apiTagsList(_c: Context, _tagRepository: TagRepository) {
  // TODO: Implement GET /api/tags endpoint to list tags
  // - Return tags array
  return _c.json({ message: "Not implemented" }, 501);
}
