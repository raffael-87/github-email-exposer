import { defineConfig } from "vitest/config";

// Separate configuration for the live smoke test. It deliberately leaves out the
// setup file of the normal run, because that one blocks all network access,
// which is exactly what this test needs.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/test/live.smoke.ts"],
    // One lookup makes several requests to a foreign service.
    testTimeout: 30000,
  },
});
