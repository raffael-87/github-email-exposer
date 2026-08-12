import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
    },
  },
  test: {
    // The tested code is plain logic and fetch handling, so no DOM is needed.
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Blocks real network access, see the file for the reason.
    setupFiles: ["./src/test/setup.ts"],
  },
});
