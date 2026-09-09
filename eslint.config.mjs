import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored reference files from the Claude Design import — not part of
    // the Next.js app, kept only as the original UI source of truth.
    "_ds/**",
    "image-slot.js",
    "support.js",
  ]),
]);

export default eslintConfig;
