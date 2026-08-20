import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MatchOverview } from "./MatchOverview";

const loggedInUser = { id: 1, username: "debater", email: "debater@example.com" };

describe("MatchOverview", () => {
  it("renders a logo link back to home", () => {
    render(
      <MatchOverview
        user={loggedInUser}
        topic="Should AI write laws?"
        status="USER_TURN"
        gradingEvents={[]}
        onSubmitArgument={vi.fn()}
      />
    );

    expect(screen.getByRole("link", { name: /debateai/i })).toHaveAttribute("href", "/");
  });

  it("renders the topic as the page heading", () => {
    render(
      <MatchOverview
        user={loggedInUser}
        topic="Should AI write laws?"
        status="USER_TURN"
        gradingEvents={[]}
        onSubmitArgument={vi.fn()}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Should AI write laws?", level: 1 })
    ).toBeInTheDocument();
  });

  it.each([
    ["INITIALIZED", /make your strongest opening argument/i],
    ["USER_TURN", /make your strongest argument/i],
    ["AI_TURN", /waiting for the ai to respond/i],
    ["EVALUATING", /judge is scoring/i],
    ["COMPLETED", /debate has concluded/i],
  ] as const)("renders a status subtitle for %s", (status, expected) => {
    render(
      <MatchOverview
        user={loggedInUser}
        topic="Should AI write laws?"
        status={status}
        gradingEvents={[]}
        onSubmitArgument={vi.fn()}
      />
    );

    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it("shows grading progress when the match is evaluating", () => {
    render(
      <MatchOverview
        user={loggedInUser}
        topic="Should AI write laws?"
        status="EVALUATING"
        gradingEvents={["JUDGE_START"]}
        onSubmitArgument={vi.fn()}
      />
    );

    expect(screen.getByTestId("grading-progress")).toBeInTheDocument();
  });

  it("does not show grading progress outside of the evaluating status", () => {
    render(
      <MatchOverview
        user={loggedInUser}
        topic="Should AI write laws?"
        status="USER_TURN"
        gradingEvents={[]}
        onSubmitArgument={vi.fn()}
      />
    );

    expect(screen.queryByTestId("grading-progress")).not.toBeInTheDocument();
  });

  it("forwards argument submission to onSubmitArgument", async () => {
    const user = userEvent.setup();
    const onSubmitArgument = vi.fn();
    render(
      <MatchOverview
        user={loggedInUser}
        topic="Should AI write laws?"
        status="USER_TURN"
        gradingEvents={[]}
        onSubmitArgument={onSubmitArgument}
      />
    );

    await user.type(screen.getByRole("textbox"), "My argument text");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(onSubmitArgument).toHaveBeenCalledWith("My argument text");
  });

  it("renders the error message when error is provided", () => {
    render(
      <MatchOverview
        user={loggedInUser}
        topic="Should AI write laws?"
        status="USER_TURN"
        gradingEvents={[]}
        onSubmitArgument={vi.fn()}
        error="Topic must not be empty."
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Topic must not be empty.");
  });

  it("renders Sign Up and Sign In links when signed out", () => {
    render(
      <MatchOverview
        user={null}
        topic="Should AI write laws?"
        status="USER_TURN"
        gradingEvents={[]}
        onSubmitArgument={vi.fn()}
      />
    );

    expect(screen.getByRole("link", { name: /sign up/i })).toHaveAttribute("href", "/register");
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/login");
  });

  it("calls onLogout when the Log Out button is clicked", async () => {
    const user = userEvent.setup();
    const onLogout = vi.fn();
    render(
      <MatchOverview
        user={loggedInUser}
        topic="Should AI write laws?"
        status="USER_TURN"
        gradingEvents={[]}
        onSubmitArgument={vi.fn()}
        onLogout={onLogout}
      />
    );

    await user.click(screen.getByRole("button", { name: /log out/i }));

    expect(onLogout).toHaveBeenCalledOnce();
  });
});
