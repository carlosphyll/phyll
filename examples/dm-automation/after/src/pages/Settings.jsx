import { useState } from "react";
import { Plug } from "lucide-react";
import { useFlows } from "../data/store.jsx";

export default function Settings() {
  const { instagram, connectInstagram, flows, showToast } = useFlows();
  const [connecting, setConnecting] = useState(false);

  // Stands in for "Sign in with Instagram". The real app would open Instagram's permission screen here.
  const connect = () => {
    setConnecting(true);
    setTimeout(() => {
      connectInstagram();
      setConnecting(false);
      showToast(flows.length ? `Instagram connected. ${flows.length} automation(s) are now active.` : "Instagram connected.");
    }, 600);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      <p className="mt-1 text-gray-500">The Instagram account Replyloop replies from.</p>

      <div className="mt-8 max-w-2xl rounded-2xl bg-white p-8 shadow-lg">
        <h2 className="text-xl font-bold text-gray-900">Instagram</h2>
        {instagram ? (
          <p className="mt-2 text-gray-600">
            Connected as <span className="font-semibold text-gray-900">@{instagram.handle}</span>. Your automations are active.
          </p>
        ) : (
          <>
            <p className="mt-2 text-gray-600">
              Sign in with Instagram and allow access to comments and messages. Your automations start replying right after.
            </p>
            <button
              onClick={connect}
              disabled={connecting}
              className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-70"
            >
              <Plug size={16} /> {connecting ? "Connecting..." : "Connect Instagram"}
            </button>
            <p className="mt-3 text-xs text-gray-500">This demo simulates the connection.</p>
          </>
        )}
      </div>
    </div>
  );
}
