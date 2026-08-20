import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useGradingEvents } from "./useGradingEvents";

class MockWebSocket {
  static instances: MockWebSocket[] = [];

  url: string;
  onmessage: ((event: { data: string }) => void) | null = null;
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  close = vi.fn();

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  emit(data: unknown) {
    this.onmessage?.({ data: JSON.stringify(data) });
  }
}

beforeEach(() => {
  MockWebSocket.instances = [];
  vi.stubGlobal("WebSocket", MockWebSocket);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useGradingEvents", () => {
  it("does not open a socket when disabled", () => {
    renderHook(() => useGradingEvents("match-1", false));

    expect(MockWebSocket.instances).toHaveLength(0);
  });

  it("opens a socket scoped to the match when enabled", () => {
    renderHook(() => useGradingEvents("match-1", true));

    expect(MockWebSocket.instances).toHaveLength(1);
    expect(MockWebSocket.instances[0].url).toContain("match-1");
  });

  it("appends received grading events as progress signals arrive", () => {
    const { result } = renderHook(() => useGradingEvents("match-1", true));
    const socket = MockWebSocket.instances[0];

    act(() => {
      socket.emit({ event: "JUDGE_START" });
    });
    expect(result.current).toEqual(["JUDGE_START"]);

    act(() => {
      socket.emit({ event: "LOGIC_EVALUATED" });
    });
    expect(result.current).toEqual(["JUDGE_START", "LOGIC_EVALUATED"]);
  });

  it("ignores malformed or unrecognized messages", () => {
    const { result } = renderHook(() => useGradingEvents("match-1", true));
    const socket = MockWebSocket.instances[0];

    act(() => {
      socket.onmessage?.({ data: "{not valid json" });
    });

    expect(result.current).toEqual([]);
  });

  it("does not duplicate an event already received", () => {
    const { result } = renderHook(() => useGradingEvents("match-1", true));
    const socket = MockWebSocket.instances[0];

    act(() => {
      socket.emit({ event: "JUDGE_START" });
      socket.emit({ event: "JUDGE_START" });
    });

    expect(result.current).toEqual(["JUDGE_START"]);
  });

  it("closes the socket on unmount", () => {
    const { unmount } = renderHook(() => useGradingEvents("match-1", true));
    const socket = MockWebSocket.instances[0];

    unmount();

    expect(socket.close).toHaveBeenCalled();
  });

  it("resets accumulated events when re-enabled for a new match", () => {
    const { result, rerender } = renderHook(
      ({ matchId, enabled }) => useGradingEvents(matchId, enabled),
      { initialProps: { matchId: "match-1", enabled: true } }
    );

    act(() => {
      MockWebSocket.instances[0].emit({ event: "JUDGE_START" });
    });
    expect(result.current).toEqual(["JUDGE_START"]);

    rerender({ matchId: "match-2", enabled: true });

    expect(result.current).toEqual([]);
    expect(MockWebSocket.instances).toHaveLength(2);
  });
});
