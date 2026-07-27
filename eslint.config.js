const globals = require("globals");

module.exports = [
  {
    ignores: ["node_modules/**", "database/**"],
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off",
      eqeqeq: "error",
      "no-var": "error",
      "prefer-const": "error",
      "prefer-template": "warn",
      "no-throw-literal": "error",
    },
  },
];
