import { Hono } from "hono";
import { rootRoute } from "./routes/root.ts";

const backend = new Hono();

backend.get("/", rootRoute);

Deno.serve(backend.fetch);
