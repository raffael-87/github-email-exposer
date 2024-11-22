import { ChangeEvent } from "react";

type IntroProps = {
  username: string;
  setUsername: (username: string) => void;
};

export default function Intro({ username, setUsername }: IntroProps) {
  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    setUsername(e.target.value);
  }

  return (
    <div className="flex flex-col items-center ">
      <h1 className="mb-3 text-2xl ">Github E-Mail Exposer</h1>
      <p className="mb-2">
        Unfortunately (or perhaps fortunately?), Github does not provide a way
        to contact other users directly unless they have chosen to display their
        email address on their profile.
      </p>
      <p className="mb-5">
        This page allows you to find a user's email address if they have not
        manually enabled email privacy. Simply enter their username below.
      </p>
      <p className="mb-5">
        <span className="font-bold">Bonus: </span>
        It also displays the email addresses of users who have committed to any
        repositories published by the searched username.
      </p>

      <label htmlFor="github-username" className="mb-3">
        Enter Github Username:
      </label>
      <p className="mb-5">
        https://github.com/
        <input
          id="github-username"
          className="w-1/2 p-2 ml-2 text-black bg-white border border-gray-300 rounded hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
          type="text"
          value={username}
          onChange={handleInputChange}
          aria-label="GitHub username"
        />
      </p>
    </div>
  );
}
