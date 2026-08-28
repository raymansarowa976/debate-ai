import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StartDebateOverview } from "./StartDebateOverview";

const loggedInUser = { id: 1, username: "debater", email: "debater@example.com" };

describe("StartDebateOverview", () => {
  it("renders a logo link back to home", () => {
    render(<StartDebateOverview user={loggedInUser} onSubmit={vi.fn()} />);

    expect(screen.getByRole("link", { name: /debateai/i })).toHaveAttribute("href", "/");
  });

  it("renders the Start a Debate heading and the match setup form", () => {
    render(<StartDebateOverview user={loggedInUser} onSubmit={vi.fn()} />);

    expect(screen.getByRole("heading", { name: /start a debate/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText(/debate topic/i)).toBeInTheDocument();
  });

  it("forwards submission to onSubmit with the trimmed topic and stance", async () => {
    const events = userEvent.setup();
    const onSubmit = vi.fn();
    render(<StartDebateOverview user={loggedInUser} onSubmit={onSubmit} />);

    await events.type(screen.getByLabelText(/debate topic/i), "  AI should write laws  ");
    await events.click(screen.getByRole("radio", { name: "Against" }));
    await events.click(screen.getByRole("button", { name: /start debate/i }));

    expect(onSubmit).toHaveBeenCalledWith("AI should write laws", "AGAINST");
  });

  it("renders the error message when error is provided", () => {
    render(
      <StartDebateOverview
        user={loggedInUser}
        onSubmit={vi.fn()}
        error="Topic must not be empty."
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Topic must not be empty.");
  });

  it("renders Sign Up and Sign In links when signed out", () => {
    render(<StartDebateOverview user={null} onSubmit={vi.fn()} />);

    expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute("href", "/register");
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/login");
  });

  it("calls onLogout when the Log Out button is clicked", async () => {
    const events = userEvent.setup();
    const onLogout = vi.fn();
    render(
      <StartDebateOverview user={loggedInUser} onSubmit={vi.fn()} onLogout={onLogout} />
    );

    await events.click(screen.getByRole("button", { name: /log out/i }));

    expect(onLogout).toHaveBeenCalledOnce();
  });
});
