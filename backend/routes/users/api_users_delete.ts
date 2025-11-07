import { Context } from "hono";
import { UserService } from "@backend/services";

export async function apiUserDelete(c: Context, userService: UserService) {
  const id = c.req.param("id");
  if (!id) {
    return c.json({ error: "User ID is required" }, 400);
  }
  try {
    await userService.deleteUser(id);
    return c.json(
      {
        success: true,
        message: "User deleted successfully",
      },
      200
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return c.json(
      {
        success: false,
        error: "Failed to delete user",
      },
      500
    );
  }
}
