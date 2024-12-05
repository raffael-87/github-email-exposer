import React from "react";
import { toast, Toaster } from "react-hot-toast";

interface DataTableProps {
  githubData: Record<string, string>;
}

function DataTable({ githubData }: DataTableProps) {
  const handleCopyToClipboard = (text: string, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      navigator.clipboard.writeText(text);
      toast.success(`${text}\n successfully copied to clipboard`);
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
            <th className="p-2 border border-gray-300 bg-stone-950">
              Profile Name
            </th>
            <th className="p-2 border border-gray-300 bg-stone-950">
              Email Address
            </th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(githubData).map(([email, name], index) => (
            <tr key={index}>
              <td className="p-2 break-words border border-gray-300">{name}</td>
              <td
                className="p-2 break-all border border-gray-300 cursor-pointer select-none hover:bg-gray-800"
                onClick={(e) => handleCopyToClipboard(email, e)}
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
