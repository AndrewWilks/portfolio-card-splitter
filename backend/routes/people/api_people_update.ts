import { Context } from "hono";
import { MemberService } from "@backend/services";

export function apiPeopleUpdate(_c: Context, _memberService: MemberService) {
  // TODO: Implement PATCH /api/people/:id endpoint to update a member
  // - Extract id from params
  // - Validate request body with UpdateMemberSchema
  // - Update member using MemberService
  // - Return member response with success message
  return _c.json({ message: "Not implemented" }, 501);
}
