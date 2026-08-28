import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroCta } from "./HeroCta";

const loggedInUser = { id: 1, username: "debater", email: "debater@example.com" };

describe("HeroCta", () => {
  it("renders nothing while the current user is loading", () => {
    const { container } = render(<HeroCta user={undefined} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders a Sign Up link when signed out", () => {
    render(<HeroCta user={null} />);

    expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute(
      "href",
      "/register"
    );
  });

  it("does not render the Start a Debate link when signed out", () => {
    render(<HeroCta user={null} />);

    expect(
      screen.queryByRole("link", { name: /start a debate/i })
    ).not.toBeInTheDocument();
  });

  it("renders the Start a Debate link when signed in", () => {
    render(<HeroCta user={loggedInUser} />);

    expect(screen.getByRole("link", { name: /start a debate/i })).toHaveAttribute(
      "href",
      "/matches/new"
    );
  });

  it("does not render the Sign Up link when signed in", () => {
    render(<HeroCta user={loggedInUser} />);

    expect(screen.queryByRole("link", { name: /sign up/i })).not.toBeInTheDocument();
  });
});
