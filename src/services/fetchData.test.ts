import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fetchData from "./fetchData";
import fetchGithubData from "./apiGithub";
import type { GithubUserData } from "./apiGithub";

vi.mock("./apiGithub", () => ({ default: vi.fn() }));

const api = vi.mocked(fetchGithubData);

function setters() {
  return {
    setGithubData: vi.fn(),
    setError: vi.fn(),
    setIsLoading: vi.fn(),
    setRateLimitExceeded: vi.fn(),
  };
}

function run(username: string, state: ReturnType<typeof setters>) {
  return fetchData(
    username,
    state.setGithubData,
    state.setError,
    state.setIsLoading,
    state.setRateLimitExceeded
  );
}

function answer(overrides: Partial<GithubUserData> = {}): GithubUserData {
  return { profileName: null, profileEmail: null, commits: [], ...overrides };
}

function commitOf(name: string, email: string) {
  return { commit: { author: { name, email } } };
}

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  api.mockReset();
});

describe("an empty input", () => {
  it("clears the view without asking the API", async () => {
    const state = setters();

    await run("", state);

    expect(api).not.toHaveBeenCalled();
    expect(state.setGithubData).toHaveBeenCalledWith(null);
    expect(state.setError).toHaveBeenCalledWith(null);
    expect(state.setIsLoading).toHaveBeenCalledWith(false);
  });
});

describe("a successful search", () => {
  it("hands the found addresses to the view", async () => {
    api.mockResolvedValue(
      answer({ commits: [commitOf("Linus", "linus@example.com")] })
    );
    const state = setters();

    await run("torvalds", state);

    expect(state.setGithubData).toHaveBeenCalledWith({
      "linus@example.com": "Linus",
    });
    expect(state.setRateLimitExceeded).toHaveBeenCalledWith(false);
  });

  it("switches the loading state off again", async () => {
    api.mockResolvedValue(answer());
    const state = setters();

    await run("torvalds", state);

    expect(state.setIsLoading).toHaveBeenNthCalledWith(1, true);
    expect(state.setIsLoading).toHaveBeenLastCalledWith(false);
  });

  it("explains it when an account exists but hides every address", async () => {
    api.mockResolvedValue(
      answer({
        commits: [commitOf("Raffael", "1+r@users.noreply.github.com")],
      })
    );
    const state = setters();

    await run("raffael-87", state);

    expect(state.setGithubData).toHaveBeenCalledWith(null);
    expect(state.setError).toHaveBeenCalledWith(
      expect.stringContaining("no email address is available")
    );
  });
});

describe("failures", () => {
  it("names the account that could not be found", async () => {
    api.mockRejectedValue(new Error("USER_NOT_FOUND"));
    const state = setters();

    await run("ghost", state);

    expect(state.setError).toHaveBeenCalledWith(
      'User "ghost" could not be found.'
    );
    expect(state.setGithubData).toHaveBeenCalledWith(null);
  });

  it("blocks further input once the rate limit is reached", async () => {
    api.mockRejectedValue(new Error("RATE_LIMIT_EXCEEDED"));
    const state = setters();

    await run("torvalds", state);

    expect(state.setRateLimitExceeded).toHaveBeenCalledWith(true);
    expect(state.setError).toHaveBeenCalledWith(
      expect.stringContaining("Too many API requests")
    );
  });

  it("falls back to a general message for anything else", async () => {
    api.mockRejectedValue(new Error("HTTP error! Status: 500"));
    const state = setters();

    await run("torvalds", state);

    expect(state.setError).toHaveBeenCalledWith(
      "An unexpected error occurred."
    );
  });

  it("survives a rejection that is not an Error", async () => {
    api.mockRejectedValue("something odd");
    const state = setters();

    await run("torvalds", state);

    expect(state.setError).toHaveBeenCalledWith(
      "An unexpected error occurred."
    );
    expect(state.setIsLoading).toHaveBeenLastCalledWith(false);
  });
});

describe("two searches at once", () => {
  // Typing produces one search after another. The older one is cancelled so it
  // neither costs API requests nor overwrites the result of the newer one.
  it("lets the newer search win", async () => {
    let rejectFirst: (reason: unknown) => void = () => {};
    const neverResolves = new Promise<GithubUserData>((_resolve, reject) => {
      rejectFirst = reject;
    });

    api.mockImplementationOnce((_username, signal) => {
      signal?.addEventListener("abort", () =>
        rejectFirst(new DOMException("Aborted", "AbortError"))
      );
      return neverResolves;
    });
    api.mockResolvedValueOnce(
      answer({ commits: [commitOf("Bob", "bob@example.com")] })
    );

    const state = setters();
    const older = run("alice", state);
    const newer = run("bob", state);
    await Promise.all([older, newer]);

    expect(state.setGithubData).toHaveBeenCalledTimes(1);
    expect(state.setGithubData).toHaveBeenCalledWith({
      "bob@example.com": "Bob",
    });
    expect(state.setError).not.toHaveBeenCalledWith(
      expect.stringContaining("alice")
    );
    expect(state.setIsLoading).toHaveBeenLastCalledWith(false);
  });

  it("aborts the request of the search it replaces", async () => {
    const seen: AbortSignal[] = [];
    api.mockImplementation((_username, signal) => {
      if (signal) seen.push(signal);
      return Promise.resolve(answer());
    });

    const state = setters();
    // Both are started before either is awaited, otherwise the first one is
    // already finished and there is nothing left to abort.
    const older = run("alice", state);
    const newer = run("bob", state);
    await Promise.all([older, newer]);

    expect(seen).toHaveLength(2);
    expect(seen[0].aborted).toBe(true);
    expect(seen[1].aborted).toBe(false);
  });
});
