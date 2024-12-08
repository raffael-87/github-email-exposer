import { toast, Toaster } from "react-hot-toast";
import ScrollToTopButton from "./ScrollToTopButton";

interface DataTableProps {
  githubData: Record<string, string>;
}

function DataTable({ githubData }: DataTableProps) {
  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${text} successfully copied to clipboard`);
    } catch (err) {
      toast.error(`Error: Could not copy ${text} to clipboard`);
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <Toaster />
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="p-2 border border-gray-300 bg-stone-950">Full Name</th>
            <th className="p-2 border border-gray-300 bg-stone-950">Email Address</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(githubData).map(([email, name], index) => (
            <tr key={index}>
              <td className="p-2 break-words border border-gray-300">{name}</td>
              <td
                className="p-2 break-all border border-gray-300 cursor-pointer select-none hover:bg-gray-800"
                onClick={() => handleCopyToClipboard(email)}
                title="Click to copy to clipboard"
              >
                {email}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ScrollToTopButton />
    </div>
  );
}

export default DataTable;
