import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { GradingProgress } from "./GradingProgress";

describe("GradingProgress", () => {
  it("renders all three steps as pending when no events have arrived", () => {
    render(<GradingProgress events={[]} />);

    expect(screen.getByTestId("grading-step-JUDGE_START")).toHaveAttribute(
      "data-status",
      "pending"
    );
    expect(screen.getByTestId("grading-step-LOGIC_EVALUATED")).toHaveAttribute(
      "data-status",
      "pending"
    );
    expect(screen.getByTestId("grading-step-FINAL_COMPILATION")).toHaveAttribute(
      "data-status",
      "pending"
    );
  });

  it("marks the first step active once JUDGE_START arrives", () => {
    render(<GradingProgress events={["JUDGE_START"]} />);

    expect(screen.getByTestId("grading-step-JUDGE_START")).toHaveAttribute(
      "data-status",
      "active"
    );
    expect(screen.getByTestId("grading-step-LOGIC_EVALUATED")).toHaveAttribute(
      "data-status",
      "pending"
    );
    expect(screen.getByTestId("grading-step-FINAL_COMPILATION")).toHaveAttribute(
      "data-status",
      "pending"
    );
  });

  it("marks earlier steps done and the latest reached step active", () => {
    render(<GradingProgress events={["JUDGE_START", "LOGIC_EVALUATED"]} />);

    expect(screen.getByTestId("grading-step-JUDGE_START")).toHaveAttribute(
      "data-status",
      "done"
    );
    expect(screen.getByTestId("grading-step-LOGIC_EVALUATED")).toHaveAttribute(
      "data-status",
      "active"
    );
    expect(screen.getByTestId("grading-step-FINAL_COMPILATION")).toHaveAttribute(
      "data-status",
      "pending"
    );
  });

  it("marks every step done once FINAL_COMPILATION arrives", () => {
    render(
      <GradingProgress
        events={["JUDGE_START", "LOGIC_EVALUATED", "FINAL_COMPILATION"]}
      />
    );

    expect(screen.getByTestId("grading-step-JUDGE_START")).toHaveAttribute(
      "data-status",
      "done"
    );
    expect(screen.getByTestId("grading-step-LOGIC_EVALUATED")).toHaveAttribute(
      "data-status",
      "done"
    );
    expect(screen.getByTestId("grading-step-FINAL_COMPILATION")).toHaveAttribute(
      "data-status",
      "done"
    );
  });

  it("renders a descriptive message for each step", () => {
    render(<GradingProgress events={[]} />);

    expect(screen.getByText(/judge is reviewing/i)).toBeInTheDocument();
    expect(screen.getByText(/scoring logic/i)).toBeInTheDocument();
    expect(screen.getByText(/compiling the final scorecard/i)).toBeInTheDocument();
  });

  it("renders out-of-order or duplicate events without breaking the progression", () => {
    render(<GradingProgress events={["JUDGE_START", "JUDGE_START"]} />);

    expect(screen.getByTestId("grading-step-JUDGE_START")).toHaveAttribute(
      "data-status",
      "active"
    );
  });

  it("exposes a live region for assistive tech", () => {
    render(<GradingProgress events={[]} />);

    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
