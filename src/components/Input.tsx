import { ChangeEvent, useRef, useEffect } from "react";

type InputProps = {
  username: string;
  setUsername: (username: string) => void;
  APIRequestCounter: number;
};

export default function Input({
  username,
  setUsername,
  APIRequestCounter,
}: InputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    setUsername(e.target.value);
  }

  return (
    <div className="flex flex-col items-center mt-6">
      <label htmlFor="github-username" className="block mb-2">
        Enter GitHub Username:
      </label>
      <div className="flex items-center w-full max-w-md">
        <span className="mr-1 text-sm">https://github.com/</span>
        <input
          id="github-username"
          className="flex-grow w-1/2 p-2 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500"
          type="text"
          value={username}
          onChange={handleInputChange}
          ref={inputRef}
          disabled={APIRequestCounter <= 0}
          placeholder="username"
        />
      </div>
      {APIRequestCounter <= 0 && (
        <p className="mt-2 text-sm text-red-500">Out of API requests</p>
      )}
    </div>
  );
}
