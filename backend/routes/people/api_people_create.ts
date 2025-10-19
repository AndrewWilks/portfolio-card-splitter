import { Context } from "hono";

export function apiPeopleCreate(c: Context) {
  // TODO: Implement POST /api/people endpoint to create a new member
  // - Validate request body with CreateMemberSchema
  // - Create member using MemberService
  // - Return member response with success message
  return c.json({ message: "Not implemented" }, 501);
}
