const API_BASE_URL = "https://api.github.com";

export async function fetchGithubData(username: string): Promise<any> {
  const response = await fetch(
    `${API_BASE_URL}/users/${username}/events/public`
  );
  if (response.status === 404) {
    throw new Error("User not found");
  }
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return await response.json();
}
