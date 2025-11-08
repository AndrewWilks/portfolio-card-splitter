import { assertEquals, assertNotEquals, assert } from "@std/assert";
import { PasswordService } from "../../services/passwordService.ts";

Deno.test("PasswordService - hash() should create a valid bcrypt hash", async () => {
  const passwordService = new PasswordService();
  const password = "TestPassword123!";
  
  const hash = await passwordService.hash(password);
  
  // bcrypt hashes start with $2a$, $2b$, or $2y$
  assert(hash.startsWith("$2"), "Hash should start with $2 (bcrypt format)");
  assertEquals(hash.length, 60, "bcrypt hash should be 60 characters");
});

Deno.test("PasswordService - hash() should create different hashes for same password", async () => {
  const passwordService = new PasswordService();
  const password = "TestPassword123!";
  
  const hash1 = await passwordService.hash(password);
  const hash2 = await passwordService.hash(password);
  
  assertNotEquals(hash1, hash2, "Different salts should produce different hashes");
});

Deno.test("PasswordService - verify() should verify correct password", async () => {
  const passwordService = new PasswordService();
  const password = "TestPassword123!";
  
  const hash = await passwordService.hash(password);
  const isValid = await passwordService.verify(password, hash);
  
  assertEquals(isValid, true, "Correct password should verify successfully");
});

Deno.test("PasswordService - verify() should reject incorrect password", async () => {
  const passwordService = new PasswordService();
  const password = "TestPassword123!";
  const wrongPassword = "WrongPassword123!";
  
  const hash = await passwordService.hash(password);
  const isValid = await passwordService.verify(wrongPassword, hash);
  
  assertEquals(isValid, false, "Incorrect password should not verify");
});

Deno.test("PasswordService - verify() should handle invalid hash gracefully", async () => {
  const passwordService = new PasswordService();
  const password = "TestPassword123!";
  const invalidHash = "not-a-valid-hash";
  
  const isValid = await passwordService.verify(password, invalidHash);
  
  assertEquals(isValid, false, "Invalid hash should return false, not throw");
});

Deno.test("PasswordService - validateStrength() should accept valid strong password", () => {
  const passwordService = new PasswordService();
  
  const valid = passwordService.validateStrength("StrongP@ss123");
  
  assertEquals(valid, true, "Valid password should pass strength validation");
});

Deno.test("PasswordService - validateStrength() should reject password too short", () => {
  const passwordService = new PasswordService();
  
  const valid = passwordService.validateStrength("Sh0rt!");
  
  assertEquals(valid, false, "Password shorter than 8 characters should fail");
});

Deno.test("PasswordService - validateStrength() should reject password without uppercase", () => {
  const passwordService = new PasswordService();
  
  const valid = passwordService.validateStrength("nouppercase123!");
  
  assertEquals(valid, false, "Password without uppercase should fail");
});

Deno.test("PasswordService - validateStrength() should reject password without lowercase", () => {
  const passwordService = new PasswordService();
  
  const valid = passwordService.validateStrength("NOLOWERCASE123!");
  
  assertEquals(valid, false, "Password without lowercase should fail");
});

Deno.test("PasswordService - validateStrength() should reject password without number", () => {
  const passwordService = new PasswordService();
  
  const valid = passwordService.validateStrength("NoNumbers!");
  
  assertEquals(valid, false, "Password without number should fail");
});

Deno.test("PasswordService - validateStrength() should reject password without special character", () => {
  const passwordService = new PasswordService();
  
  const valid = passwordService.validateStrength("NoSpecial123");
  
  assertEquals(valid, false, "Password without special character should fail");
});

Deno.test("PasswordService - getStrengthValidation() should return valid for strong password", () => {
  const passwordService = new PasswordService();
  
  const result = passwordService.getStrengthValidation("StrongP@ss123");
  
  assertEquals(result.valid, true, "Should be valid");
  assertEquals(result.errors.length, 0, "Should have no errors");
});

Deno.test("PasswordService - getStrengthValidation() should return detailed errors", () => {
  const passwordService = new PasswordService();
  
  const result = passwordService.getStrengthValidation("weak");
  
  assertEquals(result.valid, false, "Should be invalid");
  assert(result.errors.length > 0, "Should have errors");
  assert(result.errors.some((e: string) => e.includes("8 characters")), "Should mention length requirement");
});

Deno.test("PasswordService - getStrengthValidation() should list all failing requirements", () => {
  const passwordService = new PasswordService();
  
  const result = passwordService.getStrengthValidation("short");
  
  assertEquals(result.valid, false);
  // Should fail: length, uppercase, number, special char
  assert(result.errors.length >= 4, "Should have multiple errors");
});
