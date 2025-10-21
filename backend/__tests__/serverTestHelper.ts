import { Hono } from "hono";

export class TestServer {
  private server: Deno.HttpServer | null = null;
  private controller: AbortController | null = null;

  constructor(private app: Hono, private port: number = 3001) {}

  async start(): Promise<string> {
    if (this.server) {
      throw new Error("Server is already running");
    }

    this.controller = new AbortController();
    this.server = await Deno.serve(
      { port: this.port, signal: this.controller.signal },
      this.app.fetch,
    );

    return `http://localhost:${this.port}`;
  }

  async stop(): Promise<void> {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }

    if (this.server) {
      await this.server.finished;
      this.server = null;
    }
  }

  get baseUrl(): string {
    return `http://localhost:${this.port}`;
  }
}
