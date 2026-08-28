import { csrfHeaders } from "./csrf";

async function parseErrorDetail(res: Response, fallback: string): Promise<string> {
  const body = await res.json().catch(() => ({}));
  if (typeof body.detail === "string") return body.detail;
  const firstFieldError = Object.values(body).find(
    (value): value is string[] => Array.isArray(value) && typeof value[0] === "string"
  );
  if (firstFieldError) return firstFieldError[0];
  return fallback;
}

export type MatchStatus =
  | "INITIALIZED"
  | "USER_TURN"
  | "AI_TURN"
  | "EVALUATING"
  | "COMPLETED";

export type Stance = "FOR" | "AGAINST";

export interface MatchSummary {
  id: string;
  topic: string;
  user_stance: Stance;
  status: MatchStatus;
  created_at: string;
}

export interface MessageDTO {
  id: number;
  sender: "USER" | "AI";
  content: string;
  created_at: string;
}

export interface RoundDTO {
  id: number;
  round_number: number;
  messages: MessageDTO[];
}

export interface MatchDetail {
  id: string;
  topic: string;
  status: MatchStatus;
  created_at: string;
  updated_at: string;
  rounds: RoundDTO[];
}

export async function createMatch(topic: string, userStance: Stance): Promise<MatchSummary> {
  const res = await fetch(`/api/matches/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...csrfHeaders(),
    },
    credentials: "include",
    body: JSON.stringify({ topic, user_stance: userStance }),
  });
  if (!res.ok) {
    throw new Error(await parseErrorDetail(res, `Failed to create match (${res.status})`));
  }
  return res.json();
}

export async function fetchMatch(matchId: string): Promise<MatchDetail> {
  const res = await fetch(`/api/matches/${matchId}/`, { credentials: "include" });
  if (!res.ok) throw new Error(`Failed to load match (${res.status})`);
  return res.json();
}

export async function postArgument(matchId: string, content: string): Promise<MessageDTO> {
  const res = await fetch(`/api/matches/${matchId}/messages/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...csrfHeaders(),
    },
    credentials: "include",
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    throw new Error(await parseErrorDetail(res, `Failed to submit argument (${res.status})`));
  }
  return res.json();
}
