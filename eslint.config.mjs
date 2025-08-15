// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [...compat.extends(
  "next/core-web-vitals",
  "plugin:prettier/recommended",
  "plugin:@typescript-eslint/recommended-type-checked",
  "plugin:@typescript-eslint/stylistic-type-checked",
  "plugin:vitest-globals/recommended",
  "plugin:storybook/recommended"
), {
  languageOptions: {
    parser: await import("@typescript-eslint/parser"),
    parserOptions: {
      project: true,
    },
  },
  plugins: {
    "@typescript-eslint": await import("@typescript-eslint/eslint-plugin"),
    prettier: await import("eslint-plugin-prettier"),
    "vitest-globals": await import("eslint-plugin-vitest-globals"),
  },
  rules: {
    "prettier/prettier": "error",
    "no-console": "warn",
    "@typescript-eslint/array-type": "off",
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        prefer: "type-imports",
        fixStyle: "inline-type-imports",
      },
    ],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: {
          attributes: false,
        },
      },
    ],
  },
}, ...storybook.configs["flat/recommended"]];

export default eslintConfig;
