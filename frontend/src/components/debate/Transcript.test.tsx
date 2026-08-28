import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Transcript } from "./Transcript";
import type { RoundDTO } from "@/lib/api/matches";

function round(overrides: Partial<RoundDTO> & { round_number: number }): RoundDTO {
  return {
    id: overrides.round_number,
    messages: [],
    ...overrides,
  };
}

function userMessage(content: string) {
  return { id: Math.random(), sender: "USER" as const, content, created_at: "now" };
}

function aiMessage(content: string) {
  return { id: Math.random(), sender: "AI" as const, content, created_at: "now" };
}

describe("Transcript", () => {
  it("renders nothing when there are no rounds", () => {
    const { container } = render(<Transcript rounds={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders a toggle for each round labeled by its number", () => {
    const rounds = [
      round({ round_number: 1, messages: [userMessage("First"), aiMessage("Reply")] }),
      round({ round_number: 2, messages: [userMessage("Second")] }),
    ];

    render(<Transcript rounds={rounds} />);

    expect(screen.getByRole("button", { name: /round 1/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /round 2/i })).toBeInTheDocument();
  });

  it("expands the latest round by default and collapses earlier rounds", () => {
    const rounds = [
      round({ round_number: 1, messages: [userMessage("First argument")] }),
      round({ round_number: 2, messages: [userMessage("Second argument")] }),
    ];

    render(<Transcript rounds={rounds} />);

    expect(screen.getByRole("button", { name: /round 1/i })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(screen.getByRole("button", { name: /round 2/i })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(screen.queryByText("First argument")).not.toBeInTheDocument();
    expect(screen.getByText("Second argument")).toBeInTheDocument();
  });

  it("expands a collapsed round when its header is clicked", async () => {
    const user = userEvent.setup();
    const rounds = [
      round({ round_number: 1, messages: [userMessage("First argument")] }),
      round({ round_number: 2, messages: [userMessage("Second argument")] }),
    ];

    render(<Transcript rounds={rounds} />);
    await user.click(screen.getByRole("button", { name: /round 1/i }));

    expect(screen.getByRole("button", { name: /round 1/i })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(screen.getByText("First argument")).toBeInTheDocument();
  });

  it("collapses an expanded round when its header is clicked again", async () => {
    const user = userEvent.setup();
    const rounds = [round({ round_number: 1, messages: [userMessage("Only argument")] })];

    render(<Transcript rounds={rounds} />);
    await user.click(screen.getByRole("button", { name: /round 1/i }));

    expect(screen.getByRole("button", { name: /round 1/i })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(screen.queryByText("Only argument")).not.toBeInTheDocument();
  });

  it("labels each message by its sender", () => {
    const rounds = [
      round({
        round_number: 1,
        messages: [userMessage("My opening argument"), aiMessage("The rebuttal")],
      }),
    ];

    render(<Transcript rounds={rounds} />);

    const youLabel = screen.getByText("You");
    const aiLabel = screen.getByText("AI");
    expect(youLabel).toBeInTheDocument();
    expect(aiLabel).toBeInTheDocument();
    expect(screen.getByText("My opening argument")).toBeInTheDocument();
    expect(screen.getByText("The rebuttal")).toBeInTheDocument();
  });

  it("shows the AI thinking indicator in the latest round while the AI's reply is pending", () => {
    const rounds = [round({ round_number: 1, messages: [userMessage("My argument")] })];

    render(<Transcript rounds={rounds} aiTurnPending />);

    const indicator = screen.getByTestId("ai-thinking-indicator");
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveTextContent(/ai is thinking/i);
  });

  it("does not show the AI thinking indicator when nothing is pending", () => {
    const rounds = [round({ round_number: 1, messages: [userMessage("My argument")] })];

    render(<Transcript rounds={rounds} />);

    expect(screen.queryByTestId("ai-thinking-indicator")).not.toBeInTheDocument();
  });

  it("only shows the AI thinking indicator on the latest round, not earlier collapsed rounds", () => {
    const rounds = [
      round({
        round_number: 1,
        messages: [userMessage("First argument"), aiMessage("First reply")],
      }),
      round({ round_number: 2, messages: [userMessage("Second argument")] }),
    ];

    render(<Transcript rounds={rounds} aiTurnPending />);

    expect(screen.getAllByTestId("ai-thinking-indicator")).toHaveLength(1);
  });
});
