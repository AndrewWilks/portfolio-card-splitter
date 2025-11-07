import { Context } from "hono";
import { UserService } from "@backend/services";
import { User } from "@shared/entities";

export async function apiUserGet(c: Context, userService: UserService) {}
