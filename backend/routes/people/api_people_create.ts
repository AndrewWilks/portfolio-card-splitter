import { Context } from "hono";
import { MemberService } from "@backend/services";

export function apiPeopleCreate(_c: Context, _memberService: MemberService) {
  // TODO: Implement POST /api/people endpoint to create a new member
  // - Validate request body with CreateMemberSchema
  // - Create member using MemberService
  // - Return member response with success message
  return _c.json({ message: "Not implemented" }, 501);
}
