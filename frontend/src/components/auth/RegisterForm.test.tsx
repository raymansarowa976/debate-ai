import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterForm } from "./RegisterForm";

describe("RegisterForm", () => {
  it("renders username, email, and password fields", () => {
    render(<RegisterForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/^username$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  });

  it("shows the username requirements checklist under the username field", () => {
    render(<RegisterForm onSubmit={vi.fn()} />);

    expect(
      screen.getByRole("progressbar", { name: /username requirements/i })
    ).toBeInTheDocument();
  });

  it("shows the password requirements checklist under the password field", () => {
    render(<RegisterForm onSubmit={vi.fn()} />);

    expect(
      screen.getByRole("progressbar", { name: /password requirements/i })
    ).toBeInTheDocument();
  });

  it("updates the username requirements checklist as the user types", async () => {
    const user = userEvent.setup();
    render(<RegisterForm onSubmit={vi.fn()} />);

    const progress = screen.getByRole("progressbar", { name: /username requirements/i });

    await user.type(screen.getByLabelText(/^username$/i), "ab");
    expect(progress).toHaveAttribute("aria-valuenow", "0");

    await user.type(screen.getByLabelText(/^username$/i), "c");
    expect(progress).toHaveAttribute("aria-valuenow", "1");
  });

  it("updates the password requirements checklist as the user types", async () => {
    const user = userEvent.setup();
    render(<RegisterForm onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText(/^password$/i), "Val1d!Pass");

    const progress = screen.getByRole("progressbar", { name: /password requirements/i });
    expect(progress).toHaveAttribute("aria-valuenow", "5");
  });

  it("calls onSubmit with the entered values when the form is submitted", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<RegisterForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/^username$/i), "debater99");
    await user.type(screen.getByLabelText(/email/i), "debater99@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "Val1d!Pass");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      username: "debater99",
      email: "debater99@example.com",
      password: "Val1d!Pass",
    });
  });

  it("disables the fields and submit button while isSubmitting is true", () => {
    render(<RegisterForm onSubmit={vi.fn()} isSubmitting />);

    expect(screen.getByLabelText(/^username$/i)).toBeDisabled();
    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/^password$/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /create account/i })).toBeDisabled();
  });

  it("renders the error message when error is provided", () => {
    render(<RegisterForm onSubmit={vi.fn()} error="That username is taken." />);

    expect(screen.getByRole("alert")).toHaveTextContent("That username is taken.");
  });

  it("does not render an error message when error is absent", () => {
    render(<RegisterForm onSubmit={vi.fn()} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
