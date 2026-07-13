import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DebatePanel } from "./DebatePanel";

describe("DebatePanel", () => {
  it("enables the textarea and submit button when status is INITIALIZED", () => {
    render(
      <DebatePanel status="INITIALIZED" topic="Should AI write laws?" onSubmitArgument={vi.fn()} />
    );

    expect(screen.getByRole("textbox")).toBeEnabled();
    expect(screen.getByRole("button", { name: /submit/i })).toBeEnabled();
  });

  it("enables the textarea and submit button when status is USER_TURN", () => {
    render(
      <DebatePanel status="USER_TURN" topic="Should AI write laws?" onSubmitArgument={vi.fn()} />
    );

    expect(screen.getByRole("textbox")).toBeEnabled();
    expect(screen.getByRole("button", { name: /submit/i })).toBeEnabled();
  });

  it("disables the textarea and submit button when status is AI_TURN", () => {
    render(
      <DebatePanel status="AI_TURN" topic="Should AI write laws?" onSubmitArgument={vi.fn()} />
    );

    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled();
  });

  it("renders the AI-turn skeleton when status is AI_TURN", () => {
    render(
      <DebatePanel status="AI_TURN" topic="Should AI write laws?" onSubmitArgument={vi.fn()} />
    );

    expect(screen.getByTestId("ai-turn-skeleton")).toBeInTheDocument();
  });

  it.each(["INITIALIZED", "USER_TURN"] as const)(
    "does not render the AI-turn skeleton when status is %s",
    (status) => {
      render(
        <DebatePanel status={status} topic="Should AI write laws?" onSubmitArgument={vi.fn()} />
      );

      expect(screen.queryByTestId("ai-turn-skeleton")).not.toBeInTheDocument();
    }
  );

  it("calls onSubmitArgument with the textarea value when the form is submitted", async () => {
    const user = userEvent.setup();
    const onSubmitArgument = vi.fn();
    render(
      <DebatePanel status="USER_TURN" topic="Should AI write laws?" onSubmitArgument={onSubmitArgument} />
    );

    await user.type(screen.getByRole("textbox"), "My argument text");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(onSubmitArgument).toHaveBeenCalledWith("My argument text");
  });

  it("disables the textarea and submit button while isSubmitting is true even when status is USER_TURN", () => {
    render(
      <DebatePanel
        status="USER_TURN"
        topic="Should AI write laws?"
        onSubmitArgument={vi.fn()}
        isSubmitting
      />
    );

    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("button", { name: /submit/i })).toBeDisabled();
  });

  it("renders the error message when error is provided", () => {
    render(
      <DebatePanel
        status="USER_TURN"
        topic="Should AI write laws?"
        onSubmitArgument={vi.fn()}
        error="It is not your turn. Wait for the AI's response."
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "It is not your turn. Wait for the AI's response."
    );
  });

  it("does not render an error message when error is absent", () => {
    render(
      <DebatePanel status="USER_TURN" topic="Should AI write laws?" onSubmitArgument={vi.fn()} />
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
