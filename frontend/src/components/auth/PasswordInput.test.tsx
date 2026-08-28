import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasswordInput } from "./PasswordInput";

describe("PasswordInput", () => {
  it("hides the password by default", () => {
    render(
      <PasswordInput
        id="test-password"
        toggleLabel="password"
        value=""
        onChange={vi.fn()}
      />
    );

    expect(document.getElementById("test-password")).toHaveAttribute(
      "type",
      "password"
    );
  });

  it("reveals the password as plain text when the toggle is clicked", async () => {
    const user = userEvent.setup();
    render(
      <PasswordInput
        id="test-password"
        toggleLabel="password"
        value="Val1d!Pass"
        onChange={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /show password/i }));

    expect(document.getElementById("test-password")).toHaveAttribute("type", "text");
  });

  it("hides the password again when the toggle is clicked a second time", async () => {
    const user = userEvent.setup();
    render(
      <PasswordInput
        id="test-password"
        toggleLabel="password"
        value="Val1d!Pass"
        onChange={vi.fn()}
      />
    );

    const toggle = screen.getByRole("button", { name: /show password/i });
    await user.click(toggle);
    await user.click(screen.getByRole("button", { name: /hide password/i }));

    expect(document.getElementById("test-password")).toHaveAttribute(
      "type",
      "password"
    );
  });

  it("uses the toggleLabel to distinguish multiple password toggles", () => {
    render(
      <>
        <PasswordInput
          id="password-a"
          toggleLabel="password"
          value=""
          onChange={vi.fn()}
        />
        <PasswordInput
          id="password-b"
          toggleLabel="confirm password"
          value=""
          onChange={vi.fn()}
        />
      </>
    );

    expect(screen.getByRole("button", { name: "Show password" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Show confirm password" })
    ).toBeInTheDocument();
  });

  it("calls onChange with the typed value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <PasswordInput
        id="test-password"
        toggleLabel="password"
        value=""
        onChange={onChange}
      />
    );

    await user.type(document.getElementById("test-password")!, "a");

    expect(onChange).toHaveBeenCalledWith("a");
  });

  it("disables the input and the toggle button when disabled is true", () => {
    render(
      <PasswordInput
        id="test-password"
        toggleLabel="password"
        value=""
        onChange={vi.fn()}
        disabled
      />
    );

    expect(document.getElementById("test-password")).toBeDisabled();
    expect(screen.getByRole("button", { name: /show password/i })).toBeDisabled();
  });
});
