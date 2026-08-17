import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("gallery.configStatus", () => {
  it("reads the comments auth configuration from the server environment", async () => {
    const ctx = {
      user: null,
      req: {} as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    } as TrpcContext;

    const result = await appRouter.createCaller(ctx).gallery.configStatus();

    expect(result.authRequired).toBe(process.env.COMMENTS_AUTH_ENABLED === "true");
  });
});
