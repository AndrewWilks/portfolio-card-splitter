import { Context } from "hono";
import { UserService } from "@backend/services";

export async function apiUserList(c: Context, userService: UserService) {
  try {
    const users = await userService.listUsers();
    return c.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
}
