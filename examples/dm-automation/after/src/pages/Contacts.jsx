import { Link } from "react-router-dom";
import { Download } from "lucide-react";
import { useFlows } from "../data/store.jsx";

function exportCsv(contacts) {
  const rows = [["Name", "Keyword", "Last DM"], ...contacts.map((c) => [c.name, c.keyword, c.at])];
  const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "replyloop-contacts.csv";
  link.click();
}

export default function Contacts() {
  const { contacts } = useFlows();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="mt-1 text-gray-500">People who got a DM from one of your automations.</p>
        </div>
        {contacts.length > 0 && (
          <button
            onClick={() => exportCsv(contacts)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg"
          >
            <Download size={16} /> Export CSV
          </button>
        )}
      </div>

      {contacts.length === 0 ? (
        <div className="mt-8 max-w-2xl rounded-2xl bg-white p-8 shadow-lg">
          <p className="text-gray-600">
            Nobody has received a DM yet. When someone comments your keyword, they show up here with the keyword they used.
          </p>
          <Link to="/flows" className="mt-4 inline-block font-semibold text-purple-600">
            Go to automations
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          {contacts.map((c) => (
            <div key={c.id} className="rounded-2xl bg-white p-6 text-center shadow-lg transition-all duration-300 hover:scale-105">
              <p className="font-semibold text-gray-900">{c.name}</p>
              <span className="mt-3 inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                Commented {c.keyword}
              </span>
              <p className="mt-3 text-sm text-gray-500">Last DM at {c.at}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
