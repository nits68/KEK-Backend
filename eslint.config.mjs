import pluginJs from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
    { files: ["**/*.{js,mjs,cjs,ts}"] },
    {
        languageOptions: {
            globals: { ...globals.browser, ...globals.node },
            parser: tsParser,
            ecmaVersion: 2020,
            sourceType: "module",

            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            "simple-import-sort": simpleImportSort,
        },
        rules: {
            "@typescript-eslint/no-inferrable-types": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            // "space-before-function-paren": ["error", "never"],
            // "no-return-assign": "off",
            // "unicode-bom": ["error", "never"],
            // "arrow-parens": ["error", "as-needed"],
            // "@typescript-eslint/explicit-module-boundary-types": "off",
            "simple-import-sort/imports": "warn",
            "simple-import-sort/exports": "warn",
            "max-len": ["error", { code: 160, tabWidth: 4, ignoreStrings: true, ignoreUrls: true }],
        },
        ignores: ["node_modules", "dist"],
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
];
