import { afterEach, describe, expect, it, vi } from "vitest";
import { postArgument } from "./matches";

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

describe("postArgument", () => {
  it("posts the content to the match's messages endpoint", async () => {
    mockFetchOnce({ id: 1, sender: "USER", content: "hi", created_at: "now" });

    await postArgument("match-1", "My argument text");

    expect(fetch).toHaveBeenCalledWith(
      "/api/matches/match-1/messages/",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ content: "My argument text" }),
      })
    );
  });

  it("resolves with the created message on success", async () => {
    const message = { id: 1, sender: "USER", content: "hi", created_at: "now" };
    mockFetchOnce(message);

    const result = await postArgument("match-1", "hi");

    expect(result).toEqual(message);
  });

  it("throws with the server's detail message when it is not the user's turn", async () => {
    mockFetchOnce(
      { detail: "It is not your turn. Wait for the AI's response." },
      { ok: false, status: 409 }
    );

    await expect(postArgument("match-1", "hi")).rejects.toThrow(
      "It is not your turn. Wait for the AI's response."
    );
  });

  it("throws with the field-level validation reason when there is no detail field", async () => {
    mockFetchOnce(
      { content: ["Argument must be at least 50 words (got 12)."] },
      { ok: false, status: 400 }
    );

    await expect(postArgument("match-1", "too short")).rejects.toThrow(
      "Argument must be at least 50 words (got 12)."
    );
  });

  it("falls back to a generic message when the error body has neither detail nor field errors", async () => {
    mockFetchOnce({}, { ok: false, status: 400 });

    await expect(postArgument("match-1", "hi")).rejects.toThrow(
      "Failed to submit argument (400)"
    );
  });

  it("falls back to a generic message when the error response body isn't JSON", async () => {
    const response = {
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error("not json")),
    } as Response;
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));

    await expect(postArgument("match-1", "hi")).rejects.toThrow(
      "Failed to submit argument (500)"
    );
  });
});
