import { Context } from "hono";
import { UserService } from "@backend/services";

export async function apiUserUpdate(c: Context, userService: UserService) {
  const id = c.req.param("id");

  if (!id) {
    return c.json({ error: "User ID is required" }, 400);
  }

  const requestBody = await c.req.json();

  try {
    const updatedUser = await userService.updateUser(id, requestBody);

    if (!updatedUser) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json(
      {
        success: true,
        data: updatedUser,
      },
      200
    );
  } catch (error) {
    console.error("Error updating user:", error);

    return c.json(
      {
        success: false,
        error: "Failed to update user",
      },
      500
    );
  }
}
