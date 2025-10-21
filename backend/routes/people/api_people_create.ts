import { Context } from "hono";
import { MemberService } from "@backend/services";

export async function apiPeopleCreate(
  c: Context,
  memberService: MemberService
) {
  try {
    const body = await c.req.json();

    const member = await memberService.createMember(body);

    return c.json(
      {
        success: true,
        data: member.toJSON(),
        message: "Member created successfully",
      },
      201
    );
  } catch (error) {
    console.error("Error creating member:", error);

    if (error instanceof Error && error.message.includes("already exists")) {
      return c.json(
        {
          success: false,
          error: error.message,
        },
        409
      );
    }

    return c.json(
      {
        success: false,
        error: "Failed to create member",
      },
      500
    );
  }
}
