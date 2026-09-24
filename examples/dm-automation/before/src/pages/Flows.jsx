import { useState } from "react";
import { Plus, Search, Pencil, Copy, Trash2 } from "lucide-react";
import CreateFlowModal from "../components/CreateFlowModal.jsx";
import { useFlows } from "../data/store.jsx";

export default function Flows() {
  const { flows, addFlow, deleteFlow, showToast } = useFlows();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleCreate = (flow) => {
    addFlow(flow);
    setOpen(false);
    showToast("Success!");
  };

  const visible = flows.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Flows</h1>
          <p className="mt-1 text-gray-400">Manage your automation flows</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-purple-500/50 transition-all hover:scale-105"
        >
          <Plus size={18} /> Create Flow
        </button>
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg">
        <div className="relative w-72">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search flows..."
            className="w-full rounded-xl border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none"
          />
        </div>

        <table className="mt-6 w-full min-w-[900px] text-left text-sm">
          <thead className="text-xs uppercase text-gray-400">
            <tr>
              <th className="py-3">Name</th>
              <th>Trigger</th>
              <th>Status</th>
              <th>Messages</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-gray-400">
                  No data
                </td>
              </tr>
            ) : (
              visible.map((flow) => (
                <tr key={flow.id} className="group border-t border-gray-100">
                  <td className="py-4 font-medium text-gray-900">{flow.name}</td>
                  <td className="text-gray-500">{flow.trigger}</td>
                  <td>
                    <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">{flow.status}</span>
                  </td>
                  <td className="text-gray-500">{flow.messages}</td>
                  <td className="text-gray-400">{flow.created}</td>
                  <td>
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100">
                      <button onClick={() => console.log("edit", flow.id)} className="rounded p-1 text-gray-400 hover:text-gray-900">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => {}} className="rounded p-1 text-gray-400 hover:text-gray-900">
                        <Copy size={14} />
                      </button>
                      <button onClick={() => deleteFlow(flow.id)} className="rounded p-1 text-gray-400 hover:text-gray-900">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CreateFlowModal open={open} onClose={() => setOpen(false)} onCreate={handleCreate} />
    </div>
  );
}
