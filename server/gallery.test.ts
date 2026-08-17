import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(user: AuthenticatedUser | null): TrpcContext {
  return {
    user,
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  } as TrpcContext;
}

const user: AuthenticatedUser = {
  id: 999999,
  openId: "gallery-test-user",
  email: "gallery-test@example.com",
  name: "Gallery Test User",
  loginMethod: "test",
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("gallery procedures", () => {
  it("lists the registered user-provided gallery without creating data", async () => {
    const caller = appRouter.createCaller(createContext(null));
    const photos = await caller.gallery.list();

    expect(photos.length).toBeGreaterThanOrEqual(71);
    expect(photos.every((photo) => photo.url.startsWith("/manus-storage/"))).toBe(true);
  });

  it("reads comments for an existing photo", async () => {
    const caller = appRouter.createCaller(createContext(null));
    const comments = await caller.gallery.comments({ photoId: 1 });

    expect(Array.isArray(comments)).toBe(true);
  });

  it("requires authentication before adding a comment", async () => {
    const caller = appRouter.createCaller(createContext(null));

    await expect(caller.gallery.addComment({ photoId: 1, content: "Комментарий без входа" })).rejects.toThrow("Please login");
  });

  it("rejects empty and overlong comment content before any database write", async () => {
    const caller = appRouter.createCaller(createContext(user));

    await expect(caller.gallery.addComment({ photoId: 1, content: "   " })).rejects.toThrow();
    await expect(caller.gallery.addComment({ photoId: 1, content: "x".repeat(2001) })).rejects.toThrow();
  });
});
