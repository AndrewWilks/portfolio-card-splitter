import { Context } from "hono";
import { UserService } from "@backend/services";

export async function apiUserGet(c: Context, userService: UserService) {
  const id = c.req.param("id");

  if (!id) {
    return c.json({ error: "User ID is required" }, 400);
  }

  try {
    const user = await userService.getUserById(id);

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
}
