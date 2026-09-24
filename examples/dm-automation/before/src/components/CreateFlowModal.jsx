import { useState } from "react";
import { X } from "lucide-react";
import Modal from "./Modal.jsx";
import { TRIGGER_TYPES, FLOW_STATUSES } from "../data/mock.js";

const empty = {
  name: "",
  description: "",
  trigger: "",
  keywords: "",
  account: "",
  message: "",
  delay: "",
  tags: "",
  status: "ACTIVE",
};

export default function CreateFlowModal({ open, onClose, onCreate }) {
  const [form, setForm] = useState(empty);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const isValid = form.name && form.trigger && form.keywords && form.account && form.message && form.delay;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to create this flow?")) return;
    onCreate(form);
    setForm(empty);
  };

  const input = "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none";

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Create New Flow ✨</h2>
        <button onClick={onClose} className="p-1 text-gray-400">
          <X size={14} />
        </button>
      </div>
      <p className="mt-1 text-sm text-gray-400">Fill in the details below to create your automation flow.</p>

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Flow Name</label>
          <input className={input} value={form.name} onChange={set("name")} placeholder="Enter flow name" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Trigger Type</label>
          <select className={input} value={form.trigger} onChange={set("trigger")}>
            <option value="">Select trigger</option>
            {TRIGGER_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea className={input} value={form.description} onChange={set("description")} rows={2} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Keywords</label>
          <input className={input} value={form.keywords} onChange={set("keywords")} placeholder="keyword1, keyword2" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Instagram Account</label>
          <select className={input} value={form.account} onChange={set("account")}>
            <option value="">Select account</option>
            <option value="page_1784140">page_1784140</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-sm font-medium text-gray-700">Message</label>
          <textarea className={input} value={form.message} onChange={set("message")} rows={3} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Delay (seconds)</label>
          <input type="number" className={input} value={form.delay} onChange={set("delay")} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Tags</label>
          <input className={input} value={form.tags} onChange={set("tags")} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Status</label>
          <select className={input} value={form.status} onChange={set("status")}>
            {FLOW_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2 mt-4 flex justify-between">
          <button type="submit" disabled={!isValid} className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2.5 font-semibold text-white disabled:opacity-40">
            Submit
          </button>
          <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-6 py-2.5 font-semibold text-gray-600">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
