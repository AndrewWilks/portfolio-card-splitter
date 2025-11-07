import { Context } from "hono";
import { UserService } from "@backend/services";

export async function apiUserCreate(c: Context, userService: UserService) {
  const id = c.req.param("id");

  if (!id) {
    return c.json({ error: "User ID is required" }, 400);
  }

  const requestBody = await c.req.json();

  try {
    const newUser = await userService.createUser(requestBody);
    return c.json(newUser, 201);
  } catch (_) {
    return c.json(
      {
        success: false,
        error: "Failed to create user",
      },
      500
    );
  }
}
