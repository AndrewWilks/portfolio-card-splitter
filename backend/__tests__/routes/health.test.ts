import { assertEquals } from "@std/assert";
import { backend } from "../../server.ts";

Deno.test("API Health Check", async (t) => {
  await t.step("health endpoint responds", async () => {
    const request = new Request("http://localhost:3000/api/health");
    const response = await backend.fetch(request);
    assertEquals(response.status, 200);

    const body = await response.json();
    assertEquals(body.status, "ok");
  });
});
