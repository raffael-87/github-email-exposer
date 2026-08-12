import { describe, it, expect } from "vitest";
import fetchGithubData from "../services/apiGithub";
import { collectAuthors, cleanRawUserData } from "../utils/handleUserData";

// The only test that talks to the real API. It answers the question the mocked
// tests cannot answer: does GitHub still hand out the addresses the way the
// app expects? Run it with `npm run test:live`, not on every change, because
// every run eats into the hourly budget of 60 requests.
//
// It is deliberately not part of `npm test`. A test that depends on a foreign
// service and on a quota would otherwise turn red for reasons that have nothing
// to do with the code.

// A well known account that publishes a real address in its commit metadata.
const ACCOUNT = "torvalds";
const KNOWN_ADDRESS = "torvalds@linux-foundation.org";

async function lookup(username: string) {
  try {
    return await fetchGithubData(username);
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMIT_EXCEEDED") {
      throw new Error(
        "The hourly GitHub budget is used up, so the live test cannot run. " +
          "This says nothing about the code. Check the reset time with " +
          "curl https://api.github.com/rate_limit and try again later."
      );
    }
    throw error;
  }
}

describe("against the real GitHub API", () => {
  it(`finds the published address of ${ACCOUNT}`, async () => {
    const addresses = cleanRawUserData(collectAuthors(await lookup(ACCOUNT)));

    // The interesting part is not the exact count but that anything at all
    // survives the noreply filter. An empty result is what the broken app did.
    expect(Object.keys(addresses).length).toBeGreaterThan(0);
    expect(addresses).toHaveProperty(KNOWN_ADDRESS);
  });

  it("still reports an unknown account as such", async () => {
    await expect(
      lookup("this-account-really-should-not-exist-98f3ac")
    ).rejects.toThrow("USER_NOT_FOUND");
  });
});
