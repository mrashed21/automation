import nestConfig from "@repo/eslint-config/nest";

export default [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  ...nestConfig,
];
