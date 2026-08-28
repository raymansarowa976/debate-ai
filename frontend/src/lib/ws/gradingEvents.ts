export type GradingEventName = "JUDGE_START" | "LOGIC_EVALUATED" | "FINAL_COMPILATION";

export interface GradingEventMessage {
  event: GradingEventName;
}

const GRADING_EVENT_NAMES: readonly GradingEventName[] = [
  "JUDGE_START",
  "LOGIC_EVALUATED",
  "FINAL_COMPILATION",
];

function isGradingEventName(value: unknown): value is GradingEventName {
  return (
    typeof value === "string" &&
    (GRADING_EVENT_NAMES as readonly string[]).includes(value)
  );
}

export function parseGradingEvent(raw: string): GradingEventMessage | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof data !== "object" || data === null) {
    return null;
  }

  const event = (data as Record<string, unknown>).event;
  return isGradingEventName(event) ? { event } : null;
}

const DEFAULT_WS_BASE_URL = "ws://localhost/api/ws";

export function buildGradingSocketUrl(matchId: string): string {
  const base = process.env.NEXT_PUBLIC_WS_BASE_URL || DEFAULT_WS_BASE_URL;
  return `${base}/matches/${matchId}/`;
}
