import { Context } from "hono";
import { db } from "@db";
import { string, email, object } from "zod";
import { users } from "../db/db.schema.ts";
import { eq } from "drizzle-orm";
import { STATUS_CODE } from "@std/http";
import { PasswordService } from "@shared/services";

const BootstrapRequestSchema = object({
  firstName: string().min(2),
  laseName: string().min(2),
  email: email(),
  password: PasswordService.schema,
});

interface BootstrapResponseSchema {
  success: true;
  user: {
    id: string;
    email: string;
    firstName: string;
    laseName: string;
    isActive: true;
  };
  message: string;
}

// Created the first admin user for fresh installations
export async function apiAuthBootstrap(c: Context) {
  // Parse and validate request body
  const parseResult = BootstrapRequestSchema.safeParse(await c.req.json());

  // Validate request body
  if (!parseResult.success) {
    return c.json({ error: parseResult.error }, STATUS_CODE.BadRequest);
  }

  // Extract validated data
  const { laseName, firstName, email, password } = parseResult.data;

  // Check if any users exist
  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.role, "admin"))
    .limit(1);

  // If users exist, prevent bootstrapping
  if (existingUsers.length > 0) {
    return c.json(
      { error: "Bootstrap has already been completed." },
      STATUS_CODE.Forbidden
    );
  }

  // Create the admin user
  const createdUser = await db
    .insert(users)
    .values({
      email,
      passwordHash: PasswordService.hashPassword(password),
      firstName,
      lastName: laseName,
      role: "admin",
      isActive: true,
    })
    .returning({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      laseName: users.lastName,
    });

  // Verify user creation
  if (createdUser.length === 0 && Array.isArray(createdUser)) {
    return c.json(
      { error: "Failed to create admin user." },
      STATUS_CODE.InternalServerError
    );
  }

  // Return success response
  c.json<BootstrapResponseSchema>(
    {
      success: true,
      user: {
        ...createdUser[0],
        isActive: true,
      },
      message: "Bootstrap completed successfully. Admin user created.",
    },
    STATUS_CODE.Created
  );
}
