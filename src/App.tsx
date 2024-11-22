// TODOS:
/*
- Fehlermeldung, wenn Anzahl der API Requests pro h erreicht ist (vielleicht mit Counter von 60 runter?)
  ° Input field dann deaktivieren
- Jede Zeile der Ergebnisse klickbarer Link zum jeweiligen Profil im neuen browser
- Generell aufhübschen
- Fehlermeldung wenn Account gefunden, aber Email versteckt
- Fehlermeldung, wenn kein Account gefunden
- Fehlermeldung, wenn API nicht erreichbar
- Wenn ich die Email-Adresse anklicke, öffnet sich das Mailprogramm
*/

// import githubData from "./data/dummy_data.json";
import { useState, useEffect } from "react";

import Intro from "./components/Intro";
import DataTable from "./components/DataTable";
import Footer from "./components/Footer";
import { fetchGithubData } from "./services/apiGithub";

function App() {
  const [githubData, setGithubData] = useState<GithubData | null>(null);
  const [username, setUsername] = useState<string>("dabeaz");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (username) {
      fetchData();
    }
  }, [username]);

  async function fetchData() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchGithubData(username);
      setGithubData(data);
    } catch (error) {
      setError("Error fetching data. Please try again.");
      console.error("Error fetching data: ", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col w-full h-screen pt-12 mx-auto md:w-3/4 lg:w-1/2 bg-backgroundDark text-fontColorBright">
      <main>
        <Intro username={username} setUsername={setUsername} />
      </main>

      <div className="flex-grow mt-5 mx-7">
        {isLoading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {githubData && <DataTable githubData={githubData} />}
      </div>

      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default App;
