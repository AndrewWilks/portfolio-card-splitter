import { Context } from "hono";
import { MemberService } from "@backend/services";

export async function apiPeopleList(c: Context, memberService: MemberService) {
  try {
    const query = c.req.query();
    const members = await memberService.listMembers(query);

    return c.json({
      success: true,
      data: members.map((member) => member.toJSON()),
    });
  } catch (error) {
    console.error("Error listing members:", error);
    return c.json(
      {
        success: false,
        error: "Failed to list members",
      },
      500
    );
  }
}
