import fetchGithubData from "./apiGithub";
import { collectAuthors, cleanRawUserData } from "../utils/handleUserData";

// One lookup now costs several API requests, so a search that has been replaced
// by a newer one is cancelled instead of being paid for twice.
let inFlight: AbortController | null = null;

async function fetchData(
  inputUsername: string,
  setGithubData: React.Dispatch<
    React.SetStateAction<Record<string, string> | null>
  >,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setRateLimitExceeded: React.Dispatch<React.SetStateAction<boolean>>
): Promise<void> {
  inFlight?.abort();

  if (!inputUsername) {
    inFlight = null;
    setGithubData(null);
    setError(null);
    setIsLoading(false);
    return;
  }

  const controller = new AbortController();
  inFlight = controller;

  setIsLoading(true);
  setError(null);

  try {
    const data = await fetchGithubData(inputUsername, controller.signal);
    const authors = collectAuthors(data);
    const cleanedData = cleanRawUserData(authors);

    if (Object.keys(cleanedData).length === 0) {
      setError(
        `User "${inputUsername}" was found, but no email address is available. This may be because they have enabled email privacy and/or have not made any commits yet.`
      );
      setGithubData(null);
    } else {
      setGithubData(cleanedData);
    }
    setRateLimitExceeded(false);
  } catch (error) {
    // A cancelled search has already been replaced, so its result is dropped
    // silently and the newer search keeps control of the loading state.
    if (controller.signal.aborted) return;

    handleFetchError(error, inputUsername, setError, setRateLimitExceeded);
    setGithubData(null);
  } finally {
    if (inFlight === controller) {
      inFlight = null;
      setIsLoading(false);
    }
  }
}

function handleFetchError(
  error: unknown,
  username: string,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setRateLimitExceeded: React.Dispatch<React.SetStateAction<boolean>>
) {
  if (error instanceof Error) {
    switch (error.message) {
      case "USER_NOT_FOUND":
        setError(`User "${username}" could not be found.`);
        break;
      case "RATE_LIMIT_EXCEEDED":
        setError(
          "Too many API requests. GitHub allows 60 unauthenticated requests per hour and one search uses several of them. Come back later."
        );
        setRateLimitExceeded(true);
        break;
      default:
        setError("An unexpected error occurred.");
        console.error("Error fetching data: ", error);
    }
  } else {
    setError("An unexpected error occurred.");
    console.error("Error fetching data: ", error);
  }
}

export default fetchData;