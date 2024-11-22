export interface Author {
  name: string;
  email: string;
}

export function getUsernames(fetchedData: unknown): Author[] {
  let authors: Author[] = [];

  if (Array.isArray(fetchedData)) {
    for (const elem of fetchedData) {
      authors = authors.concat(getUsernames(elem)); // Hier nutzen wir Rekursion 🙂
    }
  } else if (typeof fetchedData === "object" && fetchedData !== null) {
    for (const key in fetchedData) {
      if (key === "author") {
        authors.push((fetchedData as Record<string, string>)[key]);
      } else if (typeof (fetchedData as Record<string, string>)[key] === "object") {
        authors = authors.concat(getUsernames((fetchedData as Record<string, string>)[key])); // Hier nutzen wir nochmal Rekursion 🙂
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
