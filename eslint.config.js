// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

import { defineConfig, globalIgnores } from "eslint/config";
import path from "path";

import tsdoc_plugin from "eslint-plugin-tsdoc";
import mocha_plugin from "eslint-plugin-mocha";

export default defineConfig(
    globalIgnores(["./dist/**"]),
    eslint.configs.recommended,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    {
        plugins: {
            tsdoc: tsdoc_plugin,
        },
        rules: {
            "tsdoc/syntax": "error",
        },
    },
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
        files: ["./**/*.ts"],
        ignores: ["./**/node_env/*.ts"],
        rules: {
            "no-restricted-imports": "off",
            "@typescript-eslint/no-restricted-imports": [
                "error",
                {
                    patterns: [
                        {
                            group: ["node:*", "fs", "fs/*", "path", "app"],
                            message:
                                "Not a node enviroment, node modules are not allowed",
                            allowTypeImports: true,
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ["./**/*.test.ts"],
        ...mocha_plugin.configs.recommended,
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
        files: ["./preload.ts"],
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
