import { Context } from "hono";
import { MemberService } from "@backend/services";

export function apiPeopleList(_c: Context, _memberService: MemberService) {
  // TODO: Implement GET /api/people endpoint to list members
  // - Handle query parameters: includeArchived
  // - Return members array with proper response schema
  return _c.json({ message: "Not implemented" }, 501);
}
