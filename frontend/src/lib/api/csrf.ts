export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function csrfHeaders(): HeadersInit {
  return { "X-CSRFToken": getCookie("csrftoken") ?? "" };
}

export async function ensureCsrfCookie(): Promise<void> {
  await fetch("/api/auth/csrf/", { credentials: "include" });
}
