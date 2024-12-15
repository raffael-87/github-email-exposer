const API_BASE_URL = "https://api.github.com";

async function fetchGithubData(username: string): Promise<unknown> {
  const response = await fetch(
    `${API_BASE_URL}/users/${username}/events/public`
  );
  if (response.status === 404) {
    throw new Error("USER_NOT_FOUND");
  }
  if (response.status === 403) {
    throw new Error("RATE_LIMIT_EXCEEDED");
  }
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return await response.json();
}

export default fetchGithubData;
