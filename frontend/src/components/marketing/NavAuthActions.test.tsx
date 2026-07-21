import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
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
});
