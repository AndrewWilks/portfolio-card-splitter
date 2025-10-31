import { Context } from "hono";
import { UserService } from "@backend/services";
import { User } from "@shared/entities";

export async function apiUserDelete(c: Context, userService: UserService) {
  try {
    const params = User.urlParamsSchema.parse(c.req.param());
    await userService.deleteUser(params.id);
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
