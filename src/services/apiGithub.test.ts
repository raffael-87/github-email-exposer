import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fetchGithubData from "./apiGithub";

type Route = "profile" | "search" | "repoList" | "repoCommits";
type Reply = { status?: number; body?: unknown };

function routeOf(url: string): Route {
  if (url.includes("/search/commits")) return "search";
  if (url.includes("/repos?")) return "repoList";
  if (/\/repos\/[^/]+\/[^/]+\/commits/.test(url)) return "repoCommits";
  return "profile";
}

function respond({ status = 200, body = {} }: Reply): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

const DEFAULTS: Record<Route, Reply> = {
  profile: { body: { name: "Linus Torvalds", email: null } },
  search: { body: { items: [] } },
  repoList: { body: [] },
  repoCommits: { body: [] },
};

// Answers every route with a default, so each test only spells out what it
// actually cares about. A route may also hand over a list of replies that are
// used up one after another, which is how several repositories are simulated.
function mockApi(routes: Partial<Record<Route, Reply | Reply[]>> = {}) {
  const queues = { ...routes };

  // Typed with the full fetch signature, so the tests below can read back the
  // headers and the signal that were sent, even though the body ignores them.
  const fetchMock = vi.fn<
    (url: string, init?: RequestInit) => Promise<Response>
  >(async (url) => {
    const route = routeOf(url);
    const configured = queues[route];
    const reply = Array.isArray(configured)
      ? (configured.shift() ?? DEFAULTS[route])
      : (configured ?? DEFAULTS[route]);

    return respond(reply);
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function commitOf(name: string, email: string) {
  return { commit: { author: { name, email } } };
}

const oneRepo = { body: [{ full_name: "torvalds/linux" }] };

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("error handling", () => {
  it("reports an unknown account", async () => {
    mockApi({ profile: { status: 404 } });

    await expect(fetchGithubData("ghost")).rejects.toThrow("USER_NOT_FOUND");
  });

  it("reports the rate limit when the core API answers with 403", async () => {
    mockApi({ profile: { status: 403 } });

    await expect(fetchGithubData("torvalds")).rejects.toThrow(
      "RATE_LIMIT_EXCEEDED"
    );
  });

  it("reports the rate limit when the search API answers with 429", async () => {
    mockApi({ search: { status: 429 } });

    await expect(fetchGithubData("torvalds")).rejects.toThrow(
      "RATE_LIMIT_EXCEEDED"
    );
  });

  it("passes any other HTTP error on", async () => {
    mockApi({ profile: { status: 500 } });

    await expect(fetchGithubData("torvalds")).rejects.toThrow(
      "HTTP error! Status: 500"
    );
  });
});

describe("request shape", () => {
  // Regression guard. X-GitHub-Api-Version is not CORS safelisted, so sending it
  // turns every call into a preflighted request that the browser then rejects.
  it("sends no header that would trigger a CORS preflight", async () => {
    const fetchMock = mockApi();

    await fetchGithubData("torvalds");

    for (const [, init] of fetchMock.mock.calls) {
      const headers = init?.headers as Record<string, string>;
      expect(Object.keys(headers)).toEqual(["Accept"]);
    }
  });

  // Regression guard. The addresses used to be read from the public events, but
  // GitHub removed the commit details from that payload 😪😪😪
  it("does not rely on the events endpoint any more", async () => {
    const fetchMock = mockApi({ repoList: oneRepo });

    await fetchGithubData("torvalds");

    const urls = fetchMock.mock.calls.map(([url]) => url as string);
    expect(urls.some((url) => url.includes("/events"))).toBe(false);
    expect(urls.some((url) => url.includes("/search/commits"))).toBe(true);
  });

  it("hands the abort signal to every request", async () => {
    const fetchMock = mockApi({ repoList: oneRepo });
    const controller = new AbortController();

    await fetchGithubData("torvalds", controller.signal);

    expect(fetchMock.mock.calls.length).toBeGreaterThan(1);
    for (const [, init] of fetchMock.mock.calls) {
      expect(init?.signal).toBe(controller.signal);
    }
  });

  it("encodes the username instead of pasting it into the URL", async () => {
    const fetchMock = mockApi();

    await fetchGithubData("a b/c");

    const [firstUrl] = fetchMock.mock.calls[0] as [string];
    expect(firstUrl).toContain("a%20b%2Fc");
  });
});

describe("collecting the commits", () => {
  it("takes the address from the profile", async () => {
    mockApi({
      profile: { body: { name: "Octo Mom", email: "octomom@github.com" } },
    });

    const data = await fetchGithubData("octocat");

    expect(data.profileName).toBe("Octo Mom");
    expect(data.profileEmail).toBe("octomom@github.com");
  });

  it("combines the authored commits with those of the repositories", async () => {
    mockApi({
      search: { body: { items: [commitOf("Linus", "linus@example.com")] } },
      repoList: oneRepo,
      repoCommits: { body: [commitOf("Raffi", "raffi@raffael.com")] },
    });

    const data = await fetchGithubData("torvalds");

    expect(data.commits).toHaveLength(2);
  });

  it("skips an empty repository and keeps reading the others", async () => {
    mockApi({
      search: { body: { items: [] } },
      repoList: {
        body: [{ full_name: "user/empty" }, { full_name: "user/full" }],
      },
      // An empty repository answers with 409.
      repoCommits: [
        { status: 409 },
        { body: [commitOf("Raffi", "raffi@raffael.com")] },
      ],
    });

    const data = await fetchGithubData("user");

    expect(data.commits).toEqual([commitOf("Raffi", "raffi@raffael.com")]);
  });

  it("keeps the search results when the repository scan hits the rate limit", async () => {
    mockApi({
      search: { body: { items: [commitOf("Linus", "linus@example.com")] } },
      repoList: oneRepo,
      repoCommits: { status: 403 },
    });

    const data = await fetchGithubData("torvalds");

    expect(data.commits).toEqual([commitOf("Linus", "linus@example.com")]);
  });

  it("survives a repository list that cannot be read", async () => {
    mockApi({
      search: { body: { items: [commitOf("Linus", "linus@example.com")] } },
      repoList: { status: 500 },
    });

    const data = await fetchGithubData("torvalds");

    expect(data.commits).toHaveLength(1);
  });

  // The hourly budget is only 60 requests, so the cost of a single lookup is
  // pinned down here.
  it("keeps one lookup inside a known request budget", async () => {
    const fetchMock = mockApi({
      repoList: {
        body: Array.from({ length: 5 }, (_, index) => ({
          full_name: `user/repo${index}`,
        })),
      },
    });

    await fetchGithubData("user");

    const urls = fetchMock.mock.calls.map(([url]) => url);
    // The number of repositories is capped by the page size that is asked for.
    expect(urls.find((url) => url.includes("/repos?"))).toContain("per_page=5");
    // profile + commit search + repository list + one call per repository
    expect(urls).toHaveLength(8);
  });
});
