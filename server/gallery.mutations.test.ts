import { beforeEach, describe, expect, it, vi } from "vitest";

const { createPhotoComment } = vi.hoisted(() => ({ createPhotoComment: vi.fn() }));

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return { ...actual, createPhotoComment };
});

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

const user: AuthenticatedUser = {
  id: 42,
  openId: "gallery-mutation-test-user",
  email: "gallery-mutation-test@example.com",
  name: "Gallery Mutation Test User",
  loginMethod: "test",
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function createContext(): TrpcContext {
  return { user, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] } as TrpcContext;
}

describe("gallery.addComment mutation", () => {
  beforeEach(() => createPhotoComment.mockReset());

  it("passes the authenticated user and returns the saved comment", async () => {
    const saved = { id: 77, photoId: 1, userId: user.id, content: "Подтверждаю атрибуцию фрагмента." };
    createPhotoComment.mockResolvedValue(saved);
    const caller = appRouter.createCaller(createContext());

    await expect(caller.gallery.addComment({ photoId: 1, content: saved.content })).resolves.toEqual(saved);
    expect(createPhotoComment).toHaveBeenCalledWith({ photoId: 1, userId: user.id, content: saved.content });
  });

});
