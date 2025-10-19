import { Context } from "hono";

export function apiPeopleUpdate(c: Context) {
  // TODO: Implement PATCH /api/people/:id endpoint to update a member
  // - Extract id from params
  // - Validate request body with UpdateMemberSchema
  // - Update member using MemberService
  // - Return member response with success message
  return c.json({ message: "Not implemented" }, 501);
}
