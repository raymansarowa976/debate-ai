import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NavAuthActions } from "./NavAuthActions";

const loggedInUser = { id: 1, username: "debater", email: "debater@example.com" };

describe("NavAuthActions", () => {
  it("renders nothing while the current user is loading", () => {
    const { container } = render(<NavAuthActions user={undefined} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders Sign Up and Sign In links when signed out", () => {
    render(<NavAuthActions user={null} />);

    expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute(
      "href",
      "/register"
    );
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      "/login"
    );
  });

  it("does not render the Start a Debate button when signed out", () => {
    render(<NavAuthActions user={null} />);

    expect(
      screen.queryByRole("button", { name: /start a debate/i })
    ).not.toBeInTheDocument();
  });

  it("renders the Start a Debate button when signed in", () => {
    render(<NavAuthActions user={loggedInUser} />);

    expect(screen.getByRole("button", { name: /start a debate/i })).toBeInTheDocument();
  });

  it("does not render Sign Up or Sign In links when signed in", () => {
    render(<NavAuthActions user={loggedInUser} />);

    expect(screen.queryByRole("link", { name: /sign up/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /sign in/i })).not.toBeInTheDocument();
  });

  it("renders the Log Out button when signed in", () => {
    render(<NavAuthActions user={loggedInUser} />);

    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
  });

  it("does not render the Log Out button when signed out", () => {
    render(<NavAuthActions user={null} />);

    expect(screen.queryByRole("button", { name: /log out/i })).not.toBeInTheDocument();
  });

  it("calls onLogout when the Log Out button is clicked", async () => {
    const user = userEvent.setup();
    const onLogout = vi.fn();
    render(<NavAuthActions user={loggedInUser} onLogout={onLogout} />);

    await user.click(screen.getByRole("button", { name: /log out/i }));

    expect(onLogout).toHaveBeenCalledOnce();
  });

  it("disables the Log Out button while isLoggingOut is true", () => {
    render(<NavAuthActions user={loggedInUser} isLoggingOut />);

    expect(screen.getByRole("button", { name: /log out/i })).toBeDisabled();
  });
});
