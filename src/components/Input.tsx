import { ChangeEvent, useRef, useEffect } from "react";

type InputProps = {
  username: string;
  setUsername: (username: string) => void;
  disabled: boolean;
};

export default function Input({ username, setUsername, disabled }: InputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
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
          name="custom-field"
          autoComplete="off"
          id="github-username"
          className={`flex-grow w-1/2 p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 ${
            disabled
              ? "bg-gray-900 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-900"
          }`}
          type="text"
          value={username}
          onChange={handleInputChange}
          ref={inputRef}
          disabled={disabled}
          placeholder="username"
        />
      </div>
    </div>
  );
}
