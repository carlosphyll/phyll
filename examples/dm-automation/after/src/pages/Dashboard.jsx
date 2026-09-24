import { Link } from "react-router-dom";
import { Users, Send, Zap, Plus, Plug } from "lucide-react";
import { useFlows } from "../data/store.jsx";

const createLink =
  "inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-3 font-semibold text-white shadow-lg";

export default function Dashboard() {
  const { flows, contacts, instagram } = useFlows();

  if (flows.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Start here 👋</h1>
        <p className="mt-1 text-gray-500">An automation sends a DM to everyone who comments a keyword on your posts.</p>
        <div className="mt-8 max-w-2xl rounded-2xl bg-white p-8 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-900">Create your first automation</h2>
          <p className="mt-1 text-gray-500">Choose a keyword and write the DM. You can test it before you connect Instagram.</p>
          <Link to="/flows?new=1" className={`${createLink} mt-6`}>
            <Plus size={18} /> Create automation
          </Link>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Automations", value: flows.length, icon: Zap },
    { label: "DMs sent", value: flows.reduce((sum, f) => sum + f.messages, 0), icon: Send },
    { label: "Contacts", value: contacts.length, icon: Users },
    { label: "Instagram", value: instagram ? "Connected" : "Not connected", icon: Plug },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Dashboard 👋</h1>
      <p className="mt-1 text-gray-500">
        {instagram ? "Your automations are answering comments." : "Connect Instagram so your automations start answering comments."}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <Icon size={22} />
            </div>
            <p className="mt-4 text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions ⚡</h2>
        <div className="mt-4 flex flex-wrap gap-4">
          <Link to="/flows?new=1" className={createLink}>
            <Plus size={18} /> New Automation
          </Link>
          {!instagram && (
            <Link to="/settings" className="flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700">
              <Plug size={18} /> Connect Instagram
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
