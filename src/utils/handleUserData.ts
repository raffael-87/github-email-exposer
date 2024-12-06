export interface Author {
  name: string;
  email: string;
}

export function getUsernames(fetchedData: unknown): Author[] {
  let authors: Author[] = [];

  if (Array.isArray(fetchedData)) {
    for (const elem of fetchedData) {
      authors = authors.concat(getUsernames(elem)); // Recursive call for arrays
    }
  } else if (typeof fetchedData === "object" && fetchedData !== null) {
    for (const key in fetchedData) {
      const value = (fetchedData as Record<string, unknown>)[key];

      // Check for 'commits' array in the new structure
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

      // Check for 'author' in the old structure
      if (key === "author" && typeof value === "object") {
        const name = (value as Record<string, string>).name;
        const email = (value as Record<string, string>).email;

        if (name && email) {
          authors.push({ name, email });
        }
      }

      // Continue traversing other objects recursively
      if (typeof value === "object" && value !== null) {
        authors = authors.concat(getUsernames(value));
      }
    }
  }

  return authors;
}

export function cleanRawUserData(authors: Author[]): Record<string, string> {
  const authorsDict: Record<string, string> = {};

  // Schritt 1: Ein User kann mehrere E-Mail Adressen haben, aber jede E-Mail Adresse nur einen Nutzer.
  // Daher müssen wir die Email-Adresse als Key und den Namen als Value nehmen.
  authors.forEach((author) => {
    authorsDict[author.email] = author.name;
  });

  // Schritt 2: Kopie erstellen, damit wir die Iteration nicht stören wenn wir direkt im gleichen Array zu löschen anfangen (in Schritt 3).
  const keysCopy = Object.keys(authorsDict);

  // Schritt 3: Entferne Einträge von Usern, die ihre Email-Adresse verbergen, sprich deren E-Mail Adresse den String '@users.noreply.github.com' enthält.
  keysCopy.forEach((email) => {
    if (email.includes("@users.noreply.github.com")) {
      delete authorsDict[email];
    }
  });

  return authorsDict;
}
