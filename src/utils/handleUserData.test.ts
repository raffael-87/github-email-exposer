import { describe, it, expect } from "vitest";
import { collectAuthors, cleanRawUserData } from "./handleUserData";
import type { GithubUserData, CommitPerson } from "../services/apiGithub";

function userData(overrides: Partial<GithubUserData> = {}): GithubUserData {
  return { profileName: null, profileEmail: null, commits: [], ...overrides };
}

function commit(author?: CommitPerson, committer?: CommitPerson) {
  return { commit: { author, committer } };
}

const linus: CommitPerson = {
  name: "Linus Torvalds",
  email: "torvalds@linux-foundation.org",
};

describe("collectAuthors", () => {
  it("reads the author of a commit", () => {
    const result = collectAuthors(userData({ commits: [commit(linus)] }));

    expect(result).toEqual([
      { name: "Linus Torvalds", email: "torvalds@linux-foundation.org" },
    ]);
  });

  it("reads author and committer, because they can differ", () => {
    const maintainer: CommitPerson = {
      name: "Greg Kroah-Hartman",
      email: "gregkh@linuxfoundation.org",
    };

    const result = collectAuthors(
      userData({ commits: [commit(linus, maintainer)] })
    );

    expect(result).toHaveLength(2);
    expect(result).toContainEqual({
      name: "Greg Kroah-Hartman",
      email: "gregkh@linuxfoundation.org",
    });
  });

  it("takes the address a user published on their profile", () => {
    const result = collectAuthors(
      userData({ profileName: "Octo Cat", profileEmail: "octo@github.com" })
    );

    expect(result).toEqual([{ name: "Octo Cat", email: "octo@github.com" }]);
  });

  it("falls back to the address as name when the profile has none", () => {
    const result = collectAuthors(userData({ profileEmail: "octo@github.com" }));

    expect(result).toEqual([
      { name: "octo@github.com", email: "octo@github.com" },
    ]);
  });

  it("skips entries where name or address is missing", () => {
    const data = userData({
      commits: [
        commit({ name: "No Address" }),
        commit({ email: "no.name@example.com" }),
        commit({}),
        {},
      ],
    });

    expect(collectAuthors(data)).toEqual([]);
  });

  it("returns nothing when the account has no commits at all", () => {
    expect(collectAuthors(userData())).toEqual([]);
  });
});

describe("cleanRawUserData", () => {
  it("maps every address to its name", () => {
    const result = cleanRawUserData([
      { name: "Linus Torvalds", email: "torvalds@linux-foundation.org" },
    ]);

    expect(result).toEqual({
      "torvalds@linux-foundation.org": "Linus Torvalds",
    });
  });

  it("lists an address that appears many times only once", () => {
    const result = cleanRawUserData([
      { name: "Linus Torvalds", email: "torvalds@linux-foundation.org" },
      { name: "Linus Torvalds", email: "torvalds@linux-foundation.org" },
      { name: "Linus Torvalds", email: "torvalds@linux-foundation.org" },
    ]);

    expect(Object.keys(result)).toHaveLength(1);
  });

  it("drops the per user noreply addresses of GitHub", () => {
    const result = cleanRawUserData([
      { name: "Raffael", email: "101295119+raffael-87@users.noreply.github.com" },
    ]);

    expect(result).toEqual({});
  });

  it("drops the noreply address of the web interface", () => {
    const result = cleanRawUserData([
      { name: "GitHub", email: "noreply@github.com" },
    ]);

    expect(result).toEqual({});
  });

  it("keeps the real addresses next to the filtered ones", () => {
    const result = cleanRawUserData([
      { name: "Linus Torvalds", email: "torvalds@linux-foundation.org" },
      { name: "Hidden", email: "1234+hidden@users.noreply.github.com" },
      { name: "GitHub", email: "noreply@github.com" },
    ]);

    expect(result).toEqual({
      "torvalds@linux-foundation.org": "Linus Torvalds",
    });
  });

  it("returns an empty result for an empty list", () => {
    expect(cleanRawUserData([])).toEqual({});
  });
});
