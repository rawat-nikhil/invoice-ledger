import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export const sharedRules = {
  "no-unused-vars": "off",
  "@typescript-eslint/no-unused-vars": "error",
  "no-console": "warn",
  eqeqeq: "error",
  "consistent-return": "error",
  "@typescript-eslint/no-explicit-any": "error",
  "prefer-const": "error",
};

export const sharedConfig = tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: sharedRules,
  },
);
