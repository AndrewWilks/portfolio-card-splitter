import { Context } from "hono";

export function apiPeopleList(c: Context) {
  // TODO: Implement GET /api/people endpoint to list members
  // - Handle query parameters: includeArchived
  // - Return members array with proper response schema
  return c.json({ message: "Not implemented" }, 501);
}
