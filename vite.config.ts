import babel from "@rolldown/plugin-babel";
import { devtools } from "@tanstack/devtools-vite";
import { defineConfig, lazyPlugins } from "vite-plus";

import { tanstackRouter } from "@tanstack/router-plugin/vite";

import tailwindcss from "@tailwindcss/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";

const config = defineConfig({
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  resolve: { tsconfigPaths: true },
  plugins: lazyPlugins(() => [
    devtools(),
    tailwindcss(),
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    viteReact(),
    babel({
      presets: [reactCompilerPreset()],
    }),
  ]),
  server: {
    allowedHosts: [".trycloudflare.com"]
  }
});

export default config;
