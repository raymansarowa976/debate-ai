import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./LoginForm";

describe("LoginForm", () => {
  it("renders identifier and password fields", () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/username or email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  });

  it("calls onSubmit with the entered values when the form is submitted", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/username or email/i), "debater99");
    await user.type(screen.getByLabelText(/^password$/i), "Val1d!Pass");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      identifier: "debater99",
      password: "Val1d!Pass",
    });
  });

  it("disables the fields and submit button while isSubmitting is true", () => {
    render(<LoginForm onSubmit={vi.fn()} isSubmitting />);

    expect(screen.getByLabelText(/username or email/i)).toBeDisabled();
    expect(screen.getByLabelText(/^password$/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /log in/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Show password" })).toBeDisabled();
  });

  it("reveals the password field as plain text when its toggle is clicked", async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Show password" }));

    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute("type", "text");
  });

  it("renders the error message when error is provided", () => {
    render(<LoginForm onSubmit={vi.fn()} error="Invalid credentials." />);

    expect(screen.getByRole("alert")).toHaveTextContent("Invalid credentials.");
  });

  it("renders a link to the forgot-password page", () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    expect(screen.getByRole("link", { name: /forgot password/i })).toHaveAttribute(
      "href",
      "/forgot-password"
    );
  });

  it("does not render an error message when error is absent", () => {
    render(<LoginForm onSubmit={vi.fn()} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
