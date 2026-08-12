import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

describe("ForgotPasswordForm", () => {
  it("renders an email field", () => {
    render(<ForgotPasswordForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("calls onSubmit with the entered email when the form is submitted", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ForgotPasswordForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "debater99@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    expect(onSubmit).toHaveBeenCalledWith({ email: "debater99@example.com" });
  });

  it("disables the field and submit button while isSubmitting is true", () => {
    render(<ForgotPasswordForm onSubmit={vi.fn()} isSubmitting />);

    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeDisabled();
  });

  it("renders the error message when error is provided", () => {
    render(<ForgotPasswordForm onSubmit={vi.fn()} error="Something went wrong." />);

    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong.");
  });

  it("does not render an error message when error is absent", () => {
    render(<ForgotPasswordForm onSubmit={vi.fn()} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
