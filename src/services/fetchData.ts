import { fetchGithubData } from "./apiGithub";
import { getUsernames, cleanRawUserData } from "../utils/handleUserData";

export async function fetchData(
  inputUsername: string,
  setGithubData: React.Dispatch<
    React.SetStateAction<Record<string, string> | null>
  >,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setMaxAPIRequestCounter: React.Dispatch<React.SetStateAction<number>>
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

    setMaxAPIRequestCounter((prevCount) => prevCount - 1);
  } catch (error) {
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      setError(`User "${inputUsername}" could not be found.`);
    } else {
      setError(`User "${inputUsername}" does not exist.`);
    }
    console.error("Error fetching data: ", error);
    setGithubData(null);
  } finally {
    setIsLoading(false);
  }
}
