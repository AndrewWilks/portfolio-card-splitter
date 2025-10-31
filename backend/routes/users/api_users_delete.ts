import { Context } from "hono";
import { UserService } from "@backend/services";
import {  } from "@shared/entities";

export async function apiUserDelete(
  c: Context,
  userService: UserService,
  params: 
) {
  try {
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
