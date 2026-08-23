const tseslint = require("typescript-eslint");
const base = require("./index");

module.exports = tseslint.config(
  ...base,
  {
    rules: {
      "@typescript-eslint/no-empty-function": ["error", { allow: ["constructors"] }],
      "@typescript-eslint/consistent-type-imports": "off", // NestJS requires class value imports for runtime DI reflection metadata
      "no-console": "off",
    },
  },
);
