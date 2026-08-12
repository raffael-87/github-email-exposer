const API_BASE_URL = "https://api.github.com";

// GitHub used to ship the commit details (including the author e-mail addresses)
// inside the public events payload. That field is gone, so the addresses are now
// collected from the commit search and from the commit listings of the repositories
// the user has published.
//
// Cost of one lookup: 1 request for the profile, 1 for the commit search,
// 1 for the repository list and up to MAX_REPOS_TO_SCAN for the commit listings.
const MAX_REPOS_TO_SCAN = 5;
const COMMITS_PER_PAGE = 100; // the most the API returns in a single page

// Accept is one of the headers a browser may send without asking first. The
// X-GitHub-Api-Version header the documentation suggests is not: it turns every
// call into a preflighted request, and the answer to that preflight is rejected
// by the browser. It would buy us nothing either, because GitHub serves version
// 2022-11-28 no matter which version is asked for.
const REQUEST_HEADERS = {
  Accept: "application/vnd.github+json",
};

export interface CommitPerson {
  name?: string;
  email?: string;
}

export interface GithubCommit {
  commit?: {
    author?: CommitPerson;
    committer?: CommitPerson;
  };
}

export interface GithubUserData {
  profileEmail: string | null;
  profileName: string | null;
  commits: GithubCommit[];
}

async function request(path: string, signal?: AbortSignal): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: REQUEST_HEADERS,
    signal,
  });

  if (response.status === 404) {
    throw new Error("USER_NOT_FOUND");
  }
  // 403 is the classic answer of the core API, 429 the one of the search API
  if (response.status === 403 || response.status === 429) {
    throw new Error("RATE_LIMIT_EXCEEDED");
  }
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return await response.json();
}

// Confirms that the account exists and picks up the address from the profile,
// which some users publish there voluntarily.
async function fetchProfile(username: string, signal?: AbortSignal) {
  const profile = (await request(
    `/users/${encodeURIComponent(username)}`,
    signal
  )) as { name?: string | null; email?: string | null };

  return {
    profileName: profile.name ?? null,
    profileEmail: profile.email ?? null,
  };
}

// The commits the user has authored anywhere on GitHub, not just in their own
// repositories. This is where the address of the searched user usually shows up.
async function fetchAuthoredCommits(
  username: string,
  signal?: AbortSignal
): Promise<GithubCommit[]> {
  const query = encodeURIComponent(`author:${username}`);
  const result = (await request(
    `/search/commits?q=${query}&per_page=${COMMITS_PER_PAGE}`,
    signal
  )) as { items?: GithubCommit[] };

  return result.items ?? [];
}

// The bonus feature: everybody who has committed to a repository of the user.
async function fetchRepoCommits(
  username: string,
  signal?: AbortSignal
): Promise<GithubCommit[]> {
  const repos = (await request(
    `/users/${encodeURIComponent(username)}/repos?sort=pushed&per_page=${MAX_REPOS_TO_SCAN}`,
    signal
  )) as { full_name?: string }[];

  const commits: GithubCommit[] = [];

  for (const repo of repos) {
    if (!repo.full_name) continue;

    try {
      commits.push(
        ...((await request(
          `/repos/${repo.full_name}/commits?per_page=${COMMITS_PER_PAGE}`,
          signal
        )) as GithubCommit[])
      );
    } catch (error) {
      if (signal?.aborted) throw error;
      // An empty repository answers with 409. Skipping it keeps the others usable.
      if (error instanceof Error && error.message === "RATE_LIMIT_EXCEEDED") {
        throw error;
      }
      console.warn(`Skipped the commits of ${repo.full_name}:`, error);
    }
  }

  return commits;
}

async function fetchGithubData(
  username: string,
  signal?: AbortSignal
): Promise<GithubUserData> {
  const { profileName, profileEmail } = await fetchProfile(username, signal);
  const commits = await fetchAuthoredCommits(username, signal);

  // The bonus lookup is the expensive part and the first one to hit the rate
  // limit. If it fails we still show what the steps above have found.
  try {
    commits.push(...(await fetchRepoCommits(username, signal)));
  } catch (error) {
    if (signal?.aborted) throw error;
    console.warn("Could not read the commits of the user's repositories:", error);
  }

  return { profileName, profileEmail, commits };
}

export default fetchGithubData;
