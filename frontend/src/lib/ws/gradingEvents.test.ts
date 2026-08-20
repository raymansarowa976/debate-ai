import { afterEach, describe, expect, it, vi } from "vitest";
import { buildGradingSocketUrl, parseGradingEvent } from "./gradingEvents";

describe("parseGradingEvent", () => {
  it.each(["JUDGE_START", "LOGIC_EVALUATED", "FINAL_COMPILATION"] as const)(
    "parses a valid %s payload",
    (eventName) => {
      const result = parseGradingEvent(JSON.stringify({ event: eventName }));

      expect(result).toEqual({ event: eventName });
    }
  );

  it("returns null for malformed JSON", () => {
    expect(parseGradingEvent("{not valid json")).toBeNull();
  });

  it("returns null when the event field is missing", () => {
    expect(parseGradingEvent(JSON.stringify({}))).toBeNull();
  });

  it("returns null for an unrecognized event name", () => {
    expect(parseGradingEvent(JSON.stringify({ event: "SOMETHING_ELSE" }))).toBeNull();
  });

  it("returns null when the payload is not an object", () => {
    expect(parseGradingEvent(JSON.stringify("JUDGE_START"))).toBeNull();
  });

  it("returns null when the event field is not a string", () => {
    expect(parseGradingEvent(JSON.stringify({ event: 1 }))).toBeNull();
  });
});

describe("buildGradingSocketUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("builds a match-scoped url from NEXT_PUBLIC_WS_BASE_URL", () => {
    vi.stubEnv("NEXT_PUBLIC_WS_BASE_URL", "ws://localhost/api/ws");

    expect(buildGradingSocketUrl("abc-123")).toBe(
      "ws://localhost/api/ws/matches/abc-123/"
    );
  });

  it("falls back to a sane default when the env var is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_WS_BASE_URL", "");

    expect(buildGradingSocketUrl("abc-123")).toBe(
      "ws://localhost/api/ws/matches/abc-123/"
    );
  });
});
