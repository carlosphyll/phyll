import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Plus, Search, Trash2 } from "lucide-react";
import CreateFlowModal from "../components/CreateFlowModal.jsx";
import { useFlows } from "../data/store.jsx";

const createButton =
  "flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-purple-500/50 transition-all hover:scale-105";

export default function Flows() {
  const { flows, deleteFlow, sendTest, instagram, showToast } = useFlows();
  const [params, setParams] = useSearchParams();
  const [editing, setEditing] = useState(params.get("new") ? {} : null);
  const [query, setQuery] = useState("");

  const close = () => {
    setEditing(null);
    setParams({});
  };
  const test = (flow) => {
    sendTest(flow);
    showToast(`Test DM sent to you for "${flow.name}". You can see it in Contacts.`);
  };

  const visible = flows.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Automations</h1>
          <p className="mt-1 text-gray-500">Each one sends a DM to everyone who comments its keyword.</p>
        </div>
        {flows.length > 0 && (
          <button onClick={() => setEditing({})} className={createButton}>
            <Plus size={18} /> New Automation
          </button>
        )}
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg">
        {flows.length > 0 && (
          <div className="relative w-full max-w-72">
            <Search size={16} className="absolute left-3 top-3 text-gray-500" />
            <label htmlFor="search" className="sr-only">Search automations</label>
            <input
              id="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search automations..."
              className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            />
          </div>
        )}

        {flows.length === 0 ? (
          <div className="py-16 text-center">
            <p className="mx-auto max-w-md text-gray-500">
              No automations yet. An automation sends a DM to everyone who comments a keyword on your posts.
            </p>
            <button onClick={() => setEditing({})} className={`${createButton} mx-auto mt-6`}>
              <Plus size={18} /> Create automation
            </button>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-gray-500">
                <tr>
                  <th className="py-3">Name</th>
                  <th>Keyword</th>
                  <th>Status</th>
                  <th>DMs sent</th>
                  <th>Created</th>
                  <th>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((flow) => (
                  <tr key={flow.id} className="border-t border-gray-100">
                    <td className="py-4 font-medium text-gray-900">{flow.name}</td>
                    <td className="text-gray-600">{flow.keyword}</td>
                    <td>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          instagram ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {instagram ? "Active" : "Waiting for Instagram"}
                      </span>
                    </td>
                    <td className="text-gray-600">{flow.messages}</td>
                    <td className="text-gray-500">{flow.created}</td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <button onClick={() => test(flow)} className="rounded-lg px-2.5 py-1.5 font-medium text-purple-600 hover:bg-purple-50">
                          Send test
                        </button>
                        <button onClick={() => setEditing(flow)} className="rounded-lg px-2.5 py-1.5 font-medium text-gray-600 hover:bg-gray-100">
                          Edit
                        </button>
                        <button
                          onClick={() => deleteFlow(flow)}
                          aria-label={`Delete ${flow.name}`}
                          title="Delete"
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && <CreateFlowModal key={editing.id ?? "new"} flow={editing} onClose={close} />}
    </div>
  );
}
