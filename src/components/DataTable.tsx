import { getUsernames, cleanRawUserData } from "../utils/handleUserData";
import { toast, Toaster } from "react-hot-toast";

interface GithubData {
  name: string;
  email: string;
}

interface DataTableProps {
  githubData: GithubData[];
}

function DataTable({ githubData }: DataTableProps) {
  const userData = getUsernames(githubData);
  const finalUserData = cleanRawUserData(userData);

  const handleCopyToClipboard = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      toast.success(`${text} successfully copied to clipboard`);
    } catch (err) {
      toast.error(`Error: Could not copy ${text} to clipboard`);
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div>
      <Toaster />
      <table className="mx-auto text-xs sm:text-sm w-[75%] border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="px-4 py-2 border border-gray-300">
              Github Profile Name
            </th>
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
