export interface Requirement {
  label: string;
  met: boolean;
}

export function getUsernameRequirements(username: string): Requirement[] {
  return [{ label: "At least 3 characters", met: username.trim().length >= 3 }];
}

export function getPasswordRequirements(password: string): Requirement[] {
  return [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One number", met: /[0-9]/.test(password) },
    { label: "One special character", met: /[^A-Za-z0-9]/.test(password) },
  ];
}

export function allRequirementsMet(requirements: Requirement[]): boolean {
  return requirements.every((requirement) => requirement.met);
}
