import { CheckCircle } from "lucide-react";

export const PasswordStrengthIndicator = ({
  password,
}: {
  password: string;
}) => {
  const passwordStrength = checkPasswordStrength(password);

  return (
    <div className="mt-3 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Password strength
        </span>
        <span
          className={`text-sm font-medium
            ${passwordStrength.strength === "weak" ? "text-red-500" : ""}
            ${passwordStrength.strength === "medium" ? "text-yellow-500" : ""}
            ${passwordStrength.strength === "strong" ? "text-green-500" : ""}
            ${
              passwordStrength.strength === "very strong"
                ? "text-emerald-500"
                : ""
            }`}
        >
          {passwordStrength.strength === "weak"
            ? "Weak"
            : passwordStrength.strength === "medium"
            ? "Good"
            : passwordStrength.strength === "strong"
            ? "Strong"
            : "Very Strong"}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300
            ${passwordStrength.strength === "weak" ? "bg-red-500" : ""}
            ${passwordStrength.strength === "medium" ? "bg-yellow-500" : ""}
            ${passwordStrength.strength === "strong" ? "bg-green-500" : ""}
            ${
              passwordStrength.strength === "very strong"
                ? "bg-emerald-500"
                : ""
            }`}
          style={{
            width: `${(passwordStrength.score / 6) * 100}%`, // 1 check = ~16.6%
          }}
        />
      </div>

      {/* Requirement checklist */}
      <div className="grid grid-cols-1 gap-1 text-xs">
        <div
          className={`flex items-center gap-2 ${
            passwordStrength.checks.length ? "text-green-600" : "text-gray-400"
          }`}
        >
          <CheckCircle className="w-3 h-3" />
          <span>At least 8 characters</span>
        </div>
        <div
          className={`flex items-center gap-2 ${
            passwordStrength.checks.lengthStrong
              ? "text-green-600"
              : "text-gray-400"
          }`}
        >
          <CheckCircle className="w-3 h-3" />
          <span>12+ characters (stronger)</span>
        </div>
        <div
          className={`flex items-center gap-2 ${
            passwordStrength.checks.hasLower
              ? "text-green-600"
              : "text-gray-400"
          }`}
        >
          <CheckCircle className="w-3 h-3" />
          <span>Lowercase letter</span>
        </div>
        <div
          className={`flex items-center gap-2 ${
            passwordStrength.checks.hasUpper
              ? "text-green-600"
              : "text-gray-400"
          }`}
        >
          <CheckCircle className="w-3 h-3" />
          <span>Uppercase letter</span>
        </div>
        <div
          className={`flex items-center gap-2 ${
            passwordStrength.checks.hasNumber
              ? "text-green-600"
              : "text-gray-400"
          }`}
        >
          <CheckCircle className="w-3 h-3" />
          <span>Number</span>
        </div>
        <div
          className={`flex items-center gap-2 ${
            passwordStrength.checks.hasSpecial
              ? "text-green-600"
              : "text-gray-400"
          }`}
        >
          <CheckCircle className="w-3 h-3" />
          <span>Special character</span>
        </div>
      </div>
    </div>
  );
};

type PasswordStrength = "weak" | "medium" | "strong" | "very strong";

const checkPasswordStrength = (password: string) => {
  const checks = {
    length: password.length >= 8,
    lengthStrong: password.length >= 12, // stronger if >= 12
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  // Score based on satisfied conditions
  let score = 0;
  if (checks.length) score++;
  if (checks.lengthStrong) score++; // bonus for >=12 chars
  if (checks.hasLower) score++;
  if (checks.hasUpper) score++;
  if (checks.hasNumber) score++;
  if (checks.hasSpecial) score++;

  // Convert score into a human-readable label
  let strength: PasswordStrength;
  if (score <= 2) {
    strength = "weak";
  } else if (score === 3 || score === 4) {
    strength = "medium";
  } else if (score === 5) {
    strength = "strong";
  } else {
    strength = "very strong";
  }

  return { checks, score, strength };
};
