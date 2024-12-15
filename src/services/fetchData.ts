import fetchGithubData from "./apiGithub";
import { getUsernames, cleanRawUserData } from "../utils/handleUserData";

async function fetchData(
  inputUsername: string,
  setGithubData: React.Dispatch<
    React.SetStateAction<Record<string, string> | null>
  >,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setRateLimitExceeded: React.Dispatch<React.SetStateAction<boolean>>
): Promise<void> {
  if (!inputUsername) {
    setGithubData(null);
    setError(null);
    setIsLoading(false);
    return;
  }

  setIsLoading(true);
  setError(null);

  try {
    const data = await fetchGithubData(inputUsername);
    const authors = getUsernames(data);
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
    handleFetchError(error, inputUsername, setError, setRateLimitExceeded);
    setGithubData(null);
  } finally {
    setIsLoading(false);
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
          "Too many API requests. Only 60 requests per hour are allowed. Come back later."
        );
        setRateLimitExceeded(true);
        break;
      default:
        setError("An unexpected error occurred.");
        console.error("Error fetching data: ", error);
    }
  }
}

export default fetchData;