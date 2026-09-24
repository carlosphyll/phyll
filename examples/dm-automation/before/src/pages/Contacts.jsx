import { useState } from "react";
import { Download, Upload, Eye } from "lucide-react";
import Modal from "../components/Modal.jsx";
import { contacts } from "../data/mock.js";

export default function Contacts() {
  const [selected, setSelected] = useState(null);

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="mt-1 text-gray-400">All your subscribers in one place</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => alert("Coming soon!")} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700">
            <Upload size={16} /> Import
          </button>
          <button onClick={() => console.log("export contacts")} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-4 gap-6">
        {contacts.map((c) => (
          <div key={c.id} className="rounded-2xl bg-white p-6 text-center shadow-lg transition-all duration-300 hover:scale-105">
            <img src={c.avatar} alt="" className="mx-auto h-16 w-16 rounded-full" />
            <p className="mt-4 font-semibold text-gray-900">{c.name}</p>
            <p className="text-sm text-gray-400">{c.handle}</p>
            <span className="mt-3 inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-600">{c.status}</span>
            <button onClick={() => setSelected(c)} className="mx-auto mt-4 block rounded-lg p-1 text-gray-400">
              <Eye size={14} />
            </button>
          </div>
        ))}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)}>
        {selected && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{selected.name}</h2>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <dt className="text-gray-400">contact_status</dt>
              <dd>{selected.status}</dd>
              <dt className="text-gray-400">tags</dt>
              <dd>{selected.tags}</dd>
              <dt className="text-gray-400">last_seen</dt>
              <dd>{selected.lastSeen}</dd>
            </dl>
          </div>
        )}
      </Modal>
    </div>
  );
}
