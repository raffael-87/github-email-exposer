import { beforeEach } from "vitest";

// No test is allowed to reach the real API. Without this guard a test that
// forgets to mock fetch would quietly spend the hourly request budget and would
// then start failing for a reason that has nothing to do with the code.
beforeEach(() => {
  globalThis.fetch = (() => {
    throw new Error(
      "This test tried to reach the network. Mock fetch instead of calling the real API."
    );
  }) as typeof fetch;
});
