import { csrfHeaders } from "./csrf";

export interface CurrentUser {
  id: number;
  username: string;
  email: string;
}

async function parseErrorDetail(res: Response, fallback: string): Promise<string> {
  const body = await res.json().catch(() => ({}));
  if (typeof body.detail === "string") return body.detail;
  const firstFieldError = Object.values(body).find(
    (value): value is string[] => Array.isArray(value) && typeof value[0] === "string"
  );
  if (firstFieldError) return firstFieldError[0];
  return fallback;
}

export async function registerUser(values: {
  username: string;
  email: string;
  password: string;
}): Promise<CurrentUser> {
  const res = await fetch("/api/auth/register/", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...csrfHeaders() },
    credentials: "include",
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    throw new Error(await parseErrorDetail(res, `Registration failed (${res.status})`));
  }
  return res.json();
}

export async function loginUser(values: {
  identifier: string;
  password: string;
}): Promise<CurrentUser> {
  const res = await fetch("/api/auth/login/", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...csrfHeaders() },
    credentials: "include",
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    throw new Error(await parseErrorDetail(res, `Login failed (${res.status})`));
  }
  return res.json();
}

export async function logoutUser(): Promise<void> {
  const res = await fetch("/api/auth/logout/", {
    method: "POST",
    headers: csrfHeaders(),
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Logout failed (${res.status})`);
  }
}

export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  const res = await fetch("/api/auth/me/", { credentials: "include" });
  if (res.status === 403 || res.status === 401) return null;
  if (!res.ok) throw new Error(`Failed to load current user (${res.status})`);
  return res.json();
}
