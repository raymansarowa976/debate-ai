import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MatchSetupForm } from "./MatchSetupForm";

describe("MatchSetupForm", () => {
  it("disables submit until a topic is entered", () => {
    render(<MatchSetupForm onSubmit={vi.fn()} />);

    expect(screen.getByRole("button", { name: /start debate/i })).toBeDisabled();
  });

  it("defaults the stance to For", () => {
    render(<MatchSetupForm onSubmit={vi.fn()} />);

    expect(screen.getByRole("radio", { name: "For" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Against" })).not.toBeChecked();
  });

  it("calls onSubmit with the trimmed topic and selected stance", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<MatchSetupForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/debate topic/i), "  AI should write laws  ");
    await user.click(screen.getByRole("radio", { name: "Against" }));
    await user.click(screen.getByRole("button", { name: /start debate/i }));

    expect(onSubmit).toHaveBeenCalledWith("AI should write laws", "AGAINST");
  });

  it("disables the form while isSubmitting is true", () => {
    render(<MatchSetupForm onSubmit={vi.fn()} isSubmitting />);

    expect(screen.getByLabelText(/debate topic/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /starting/i })).toBeDisabled();
  });

  it("renders the error message when error is provided", () => {
    render(<MatchSetupForm onSubmit={vi.fn()} error="Topic must not be empty." />);

    expect(screen.getByRole("alert")).toHaveTextContent("Topic must not be empty.");
  });

  it("shows a character counter that updates as the topic is typed", async () => {
    const user = userEvent.setup();
    render(<MatchSetupForm onSubmit={vi.fn()} />);

    expect(screen.getByText("0/99")).toBeInTheDocument();

    await user.type(screen.getByLabelText(/debate topic/i), "AI should write laws");

    expect(screen.getByText("20/99")).toBeInTheDocument();
  });
});
