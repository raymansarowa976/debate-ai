import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResetPasswordForm } from "./ResetPasswordForm";

describe("ResetPasswordForm", () => {
  it("renders new password and confirm password fields", () => {
    render(<ResetPasswordForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
  });

  it("calls onSubmit with the new password when both fields match", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ResetPasswordForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/^new password$/i), "New1d!Pass");
    await user.type(screen.getByLabelText(/confirm new password/i), "New1d!Pass");
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    expect(onSubmit).toHaveBeenCalledWith({ password: "New1d!Pass" });
  });

  it("does not call onSubmit when the passwords do not match", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ResetPasswordForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/^new password$/i), "New1d!Pass");
    await user.type(screen.getByLabelText(/confirm new password/i), "Different1!");
    await user.click(screen.getByRole("button", { name: /reset password/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
  });

  it("shows the password requirements checklist", () => {
    render(<ResetPasswordForm onSubmit={vi.fn()} />);

    expect(
      screen.getByRole("progressbar", { name: /password requirements/i })
    ).toBeInTheDocument();
  });

  it("disables the fields and submit button while isSubmitting is true", () => {
    render(<ResetPasswordForm onSubmit={vi.fn()} isSubmitting />);

    expect(screen.getByLabelText(/^new password$/i)).toBeDisabled();
    expect(screen.getByLabelText(/confirm new password/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /reset password/i })).toBeDisabled();
  });

  it("renders the error message when error is provided", () => {
    render(<ResetPasswordForm onSubmit={vi.fn()} error="Invalid or expired token." />);

    expect(screen.getByRole("alert")).toHaveTextContent("Invalid or expired token.");
  });

  it("does not render an error message when error is absent", () => {
    render(<ResetPasswordForm onSubmit={vi.fn()} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
