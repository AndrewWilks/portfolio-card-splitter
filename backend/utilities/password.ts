import { hash, verify } from "@stdext/crypto/hash";

export function hashPassword(password: string): string {
  const hashedPassword = hash(
    {
      name: "argon2",
      algorithm: "argon2i",
    },
    password
  );
  return hashedPassword;
}

export function verifyPassword(
  password: string,
  hashedPassword: string
): boolean {
  const isValid = verify(
    {
      name: "argon2",
      algorithm: "argon2i",
    },
    password,
    hashedPassword
  );
  return isValid;
}
