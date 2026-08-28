import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DashboardOverview } from "./DashboardOverview";

const user = { id: 1, username: "debater", email: "debater@example.com" };

describe("DashboardOverview", () => {
  it("greets the signed-in user by username", () => {
    render(<DashboardOverview user={user} onLogout={vi.fn()} />);

    expect(
      screen.getByRole("heading", { name: /debater/i, level: 1 })
    ).toBeInTheDocument();
  });

  it("renders Start a Debate links pointing to /matches/new", () => {
    render(<DashboardOverview user={user} onLogout={vi.fn()} />);

    const links = screen.getAllByRole("link", { name: /start a debate/i });
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link).toHaveAttribute("href", "/matches/new");
    }
  });

  it("renders the how-it-works recap", () => {
    render(<DashboardOverview user={user} onLogout={vi.fn()} />);

    expect(
      screen.getByRole("heading", { name: "State your case" })
    ).toBeInTheDocument();
  });

  it("calls onLogout when the Log Out button is clicked", async () => {
    const events = userEvent.setup();
    const onLogout = vi.fn();
    render(<DashboardOverview user={user} onLogout={onLogout} />);

    await events.click(screen.getByRole("button", { name: /log out/i }));

    expect(onLogout).toHaveBeenCalledOnce();
  });

  it("disables the Log Out button while isLoggingOut is true", () => {
    render(<DashboardOverview user={user} onLogout={vi.fn()} isLoggingOut />);

    expect(screen.getByRole("button", { name: /log out/i })).toBeDisabled();
  });
});
