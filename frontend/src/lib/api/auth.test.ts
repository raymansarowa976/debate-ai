import { afterEach, describe, expect, it, vi } from "vitest";
import { forgotPassword, resetPassword } from "./auth";

function mockFetchOnce(body: unknown, init: { ok: boolean; status?: number } = { ok: true }) {
  const response = {
    ok: init.ok,
    status: init.status ?? (init.ok ? 200 : 400),
    json: () => Promise.resolve(body),
  } as Response;
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
  return response;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("forgotPassword", () => {
  it("posts the email to the forgot-password endpoint", async () => {
    mockFetchOnce({ detail: "generic message" });

    await forgotPassword("user@example.com");

    expect(fetch).toHaveBeenCalledWith(
      "/api/auth/forgot-password/",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ email: "user@example.com" }),
      })
    );
  });

  it("resolves with the response detail on success", async () => {
    mockFetchOnce({ detail: "check your email" });

    const result = await forgotPassword("user@example.com");

    expect(result.detail).toBe("check your email");
  });

  it("throws with the server error detail when the request fails", async () => {
    mockFetchOnce({ email: ["Enter a valid email address."] }, { ok: false, status: 400 });

    await expect(forgotPassword("not-an-email")).rejects.toThrow(
      "Enter a valid email address."
    );
  });
});

describe("resetPassword", () => {
  it("posts the token and password to the reset-password endpoint", async () => {
    mockFetchOnce({ detail: "Your password has been reset." });

    await resetPassword({ token: "abc123", password: "New1d!Pass" });

    expect(fetch).toHaveBeenCalledWith(
      "/api/auth/reset-password/",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ token: "abc123", password: "New1d!Pass" }),
      })
    );
  });

  it("resolves with the response detail on success", async () => {
    mockFetchOnce({ detail: "Your password has been reset." });

    const result = await resetPassword({ token: "abc123", password: "New1d!Pass" });

    expect(result.detail).toBe("Your password has been reset.");
  });

  it("throws with the server error detail when the token is invalid", async () => {
    mockFetchOnce({ detail: "Invalid or expired token." }, { ok: false, status: 400 });

    await expect(
      resetPassword({ token: "bad", password: "New1d!Pass" })
    ).rejects.toThrow("Invalid or expired token.");
  });
});
