import globals from "globals"
import react from "eslint-plugin-react"
import ts from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"

export default [
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        plugins: { react, ts },
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaFeatures: {
                    modules: true,
                    jsx: true,
                },
            },
            globals: { ...globals.browser },
        },
        rules: {
            ...react.configs.recommended.rules,
            "comma-dangle": ["error", "always-multiline"],
            "prefer-const": "error",
            "quote-props": ["error", "consistent"],
            "quotes": ["error", "double"],
            "react/jsx-uses-react": "error",
            "react/jsx-uses-vars": "error",
            "semi": ["error", "never"],
            "sort-imports": ["error", { "ignoreCase": true, "allowSeparatedGroups": true, "memberSyntaxSortOrder": ["none", "single", "multiple", "all"] }],
            "spaced-comment": ["error", "always"],
        },
    },
]