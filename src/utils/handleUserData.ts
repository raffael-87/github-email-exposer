import type { GithubUserData } from "../services/apiGithub";

export interface Author {
  name: string;
  email: string;
}

// Addresses GitHub generates itself. They belong to nobody and are of no use here.
const NOREPLY_PATTERNS = ["@users.noreply.github.com", "noreply@github.com"];

// Every commit carries an author (who wrote the change) and a committer (who
// applied it). The two can hold different addresses, so both are collected.
function collectAuthors(data: GithubUserData): Author[] {
  const authors: Author[] = [];

  if (data.profileEmail) {
    authors.push({
      name: data.profileName ?? data.profileEmail,
      email: data.profileEmail,
    });
  }

  for (const entry of data.commits) {
    for (const person of [entry.commit?.author, entry.commit?.committer]) {
      const name = person?.name;
      const email = person?.email;

      if (name && email) {
        authors.push({ name, email });
      }
    }
  }

  return authors;
}

function cleanRawUserData(authors: Author[]): Record<string, string> {
  const authorsDict: Record<string, string> = {};

  authors.forEach((author) => {
    authorsDict[author.email] = author.name;
  });

  Object.keys(authorsDict).forEach((email) => {
    if (NOREPLY_PATTERNS.some((pattern) => email.includes(pattern))) {
      delete authorsDict[email];
    }
  });

  return authorsDict;
}

export { collectAuthors, cleanRawUserData };
