import { useState } from "react";
import { Save } from "lucide-react";
import { useFlows } from "../data/store.jsx";

const tabs = ["Instagram", "General", "Billing", "Team"];

export default function Settings() {
  const { showToast } = useFlows();
  const [tab, setTab] = useState("Instagram");
  const [form, setForm] = useState({ accessToken: "", verifyToken: "", appSecret: "", pageId: "" });
  const [error, setError] = useState("");
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSave = async () => {
    if (!window.confirm("Are you sure you want to save these settings?")) return;
    try {
      await fetch("/api/instagram/connect", { method: "POST", body: JSON.stringify(form) });
      showToast("Success!");
    } catch (e) {
      console.error(e);
    }
  };

  const validate = () => {
    if (form.accessToken && form.accessToken.length < 20) setError("Invalid input");
    else setError("");
  };

  const input = "mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none";

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      <p className="mt-1 text-gray-400">Manage your account settings and preferences</p>

      <div className="mt-8 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${
              tab === t ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white" : "text-gray-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Instagram" ? (
        <div className="mt-6 max-w-2xl rounded-2xl bg-white p-8 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Connect Instagram</h2>
              <p className="mt-1 text-sm text-gray-400">Step 1 of 3: enter your Meta developer credentials</p>
            </div>
            <button onClick={handleSave} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white">
              <Save size={16} /> Save Changes
            </button>
          </div>
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Instagram Graph API Access Token</label>
              <input className={input} value={form.accessToken} onChange={set("accessToken")} onBlur={validate} />
              {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Webhook Verify Token</label>
              <input className={input} value={form.verifyToken} onChange={set("verifyToken")} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">App Secret</label>
              <input className={input} value={form.appSecret} onChange={set("appSecret")} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Facebook Page ID</label>
              <input className={input} value={form.pageId} onChange={set("pageId")} />
            </div>
          </div>
          <p className="mt-6 text-xs text-gray-400">
            Need help? <a href="#" className="text-purple-600">Read the docs</a>
          </p>
        </div>
      ) : (
        <div className="mt-6 max-w-2xl rounded-2xl bg-white p-12 text-center shadow-lg">
          <p className="text-gray-400">Coming soon 🚧</p>
        </div>
      )}
    </div>
  );
}
