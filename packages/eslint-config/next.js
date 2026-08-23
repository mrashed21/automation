/** @type {import("eslint").Linter.Config} */
const base = require("./index");

module.exports = {
  ...base,
  extends: [
    ...base.extends,
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "next/core-web-vitals",
  ],
  plugins: [...base.plugins, "react", "react-hooks", "jsx-a11y"],
  rules: {
    ...base.rules,
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/display-name": "warn",
  },
  settings: {
    ...base.settings,
    react: { version: "detect" },
  },
};
