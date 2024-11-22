import { getUsernames, cleanRawUserData } from "../utils/handleUserData";

interface GithubData {
  name: string;
  email:string;
}

interface DataTableProps {
  githubData: GithubData[];
}

function DataTable({ githubData }: DataTableProps) {
  const userData = getUsernames(githubData);
  const finalUserData = cleanRawUserData(userData);

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert(`Copied: ${text}`);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  return (
    <div>
      <table className="mx-auto text-xs sm:text-sm w-[75%] border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="px-4 py-2 border border-gray-300">Github Profile Name</th>
            <th className="px-4 py-2 border border-gray-300">E-Mail Address</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(finalUserData).map(([email, name], index) => (
            <tr key={index}>
              <td className="px-4 py-2 border border-gray-300">{name}</td>
              <td
                className="px-4 py-2 border border-gray-300 cursor-pointer hover:bg-gray-100"
                onClick={() => handleCopyToClipboard(email)}
              >
                {email}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
