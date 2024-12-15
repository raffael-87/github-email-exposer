export interface Author {
  name: string;
  email: string;
}

function getUsernames(fetchedData: unknown): Author[] {
  let authors: Author[] = [];

  if (Array.isArray(fetchedData)) {
    for (const elem of fetchedData) {
      authors = authors.concat(getUsernames(elem));
    }
  } else if (typeof fetchedData === "object" && fetchedData !== null) {
    for (const key in fetchedData) {
      const value = (fetchedData as Record<string, unknown>)[key];

      if (key === "commits" && Array.isArray(value)) {
        for (const commit of value) {
          const author = (commit as Record<string, unknown>).author;
          if (author && typeof author === "object") {
            const name = (author as Record<string, string>).name;
            const email = (author as Record<string, string>).email;

            if (name && email) {
              authors.push({ name, email });
            }
          }
        }
      }

      if (key === "author" && typeof value === "object") {
        const name = (value as Record<string, string>).name;
        const email = (value as Record<string, string>).email;

        if (name && email) {
          authors.push({ name, email });
        }
      }

      if (typeof value === "object" && value !== null) {
        authors = authors.concat(getUsernames(value));
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
    if (email.includes("@users.noreply.github.com")) {
      delete authorsDict[email];
    }
  });

  return authorsDict;
}

export { getUsernames, cleanRawUserData };