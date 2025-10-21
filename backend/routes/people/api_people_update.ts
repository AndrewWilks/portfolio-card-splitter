import { Context } from "hono";
import { MemberService } from "@backend/services";

export async function apiPeopleUpdate(
  c: Context,
  memberService: MemberService,
) {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    const member = await memberService.updateMember(id, body);

    return c.json({
      success: true,
      data: member.toJSON(),
      message: "Member updated successfully",
    });
  } catch (error) {
    console.error("Error updating member:", error);

    if (error instanceof Error) {
      if (error.message.includes("not found")) {
        return c.json(
          {
            success: false,
            error: error.message,
          },
          404,
        );
      }
      if (error.message.includes("already exists")) {
        return c.json(
          {
            success: false,
            error: error.message,
          },
          409,
        );
      }
    }

    return c.json(
      {
        success: false,
        error: "Failed to update member",
      },
      500,
    );
  }
}
