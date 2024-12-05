// TODOS:
/*
- Fehlermeldung, wenn Anzahl der API Requests pro h erreicht ist (vielleicht mit Counter von 60 runter?)
  ° Input field dann deaktivieren
- Jede Zeile der Ergebnisse klickbarer Link zum jeweiligen Profil im neuen browser
- Fehlermeldung, wenn API nicht erreichbar
*/
import { useState, useEffect } from "react";

import Input from "./components/Input";
import DataTable from "./components/DataTable";
import Footer from "./components/Footer";
import Paragraph from "./components/Paragraph";
import { fetchData } from "./services/fetchData";

import debounce from "lodash/debounce";

function App() {
  const [githubData, setGithubData] = useState<Record<string, string> | null>(
    null
  );
  const [username, setUsername] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [MaxAPIRequestsCounter, setMaxAPIRequestsCounter] =
    useState<number>(60);

  useEffect(() => {
    const debouncedFetchData = debounce((inputUsername: string) => {
      fetchData(
        inputUsername,
        setGithubData,
        setError,
        setIsLoading,
        setMaxAPIRequestsCounter
      );
    }, 300);

    debouncedFetchData(username);

    return () => {
      debouncedFetchData.cancel();
    };
  }, [username]);

  return (
    <div className="flex flex-col min-h-screen bg-backgroundDark text-fontColorBright">
      <main className="flex-grow w-full max-w-3xl px-4 py-8 mx-auto">
        <h1 className="mb-6 text-3xl font-bold text-center">
          Github E-Mail Exposer
        </h1>
        <Paragraph>
          Unfortunately (or perhaps fortunately?), Github does not provide a way
          to contact other users directly unless they have chosen to display
          their email address on their profile.
        </Paragraph>
        <Paragraph>
          This page allows you to find a GitHub user's email address, even if
          it's not displayed on their profile. The email can be retrieved as
          long as the user hasn't manually disabled its publication in their
          privacy settings for commits.
        </Paragraph>
        <Paragraph>
          Simply enter the username below to begin your search.
        </Paragraph>
        <Paragraph>
          <span className="font-bold">Bonus: </span>
          It also displays the email addresses of users who have committed to
          any repositories published by the searched username.
        </Paragraph>
        <Input
          username={username}
          setUsername={setUsername}
          MaxAPIRequestsCounter={MaxAPIRequestsCounter}
        />

        <div className="mt-8">
          {isLoading && <p className="text-center">Loading...</p>}
          {error && <p className="text-center">{error}</p>}
          {githubData && <DataTable githubData={githubData} />}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
