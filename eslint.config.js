// @ts-check

import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import mochaPlugin from "eslint-plugin-mocha";
import { defineConfig } from "eslint/config";
import path from "path";
import tseslint from "typescript-eslint";

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: path.join(import.meta.dirname, ".."),
      },
    },
  },
  {
    files: ["./**/*.ts"],
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/consistent-type-exports": "error",
    },
  },
  {
    files: ["./renderer/**/*.ts", "./renderer/*.ts"],
    rules: {
      "no-restricted-imports": "off",
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["node:*", "fs", "fs/*", "path", "app"],
              message: "Not a node enviroment, node modules are not allowed",
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
  },
  {
    files: ["./**/*.test.ts"],
    ...mochaPlugin.configs.recommended,
  },
  {
    files: ["./**/*.test.ts"],
    rules: {
      "@typescript-eslint/no-restricted-imports": "off",
      "@typescript-eslint/no-floating-promises": [
        "error",
        {
          allowForKnownSafeCalls: [
            {
              from: "package",
              name: ["describe", "it"],
              package: "node:test",
            },
          ],
        },
      ],
    },
  },

  {
    files: ["./renderer/**/preload.ts"],
    rules: {
      "no-restricted-imports": "off",
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["*", "!electron"],
              message:
                "Not a normal node enviroment, imports other than electron are not allowed",
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
  },
  eslintConfigPrettier,
);
