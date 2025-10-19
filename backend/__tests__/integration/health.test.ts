import { assertEquals } from "@std/assert";
import { backend } from "../../server.ts";
import { TestServer, withTestDB } from "../index.ts";

Deno.test("API Health Check", async (t) => {
  await withTestDB(async () => {
    const server = new TestServer(backend);

    await t.step("server starts successfully", async () => {
      const baseUrl = await server.start();
      assertEquals(baseUrl, "http://localhost:3001");
    });

    await t.step("health endpoint responds", async () => {
      const response = await fetch(`${server.baseUrl}/api/health`);
      assertEquals(response.status, 200);

      const body = await response.json();
      assertEquals(body.status, "ok");
    });

    await server.stop();
  });
});