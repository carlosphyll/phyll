import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, X } from "lucide-react";
import Modal from "./Modal.jsx";
import { useFlows } from "../data/store.jsx";

const input =
  "mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-purple-500";
const primary = "rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2.5 font-semibold text-white";

function Preview({ keyword, message }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-5">
      <p className="text-xs font-semibold uppercase text-gray-500">What they will see</p>
      <p className="mt-3 text-sm text-gray-600">
        Someone comments <span className="font-semibold text-purple-600">{keyword.trim().toUpperCase() || "your keyword"}</span>
      </p>
      <div className="mt-3 whitespace-pre-line rounded-2xl rounded-tl-sm bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 text-sm text-white">
        {message.trim() || "Your DM appears here as you type."}
      </div>
    </div>
  );
}

// flow: {} for a new automation, an existing automation to edit, or null when closed.
export default function CreateFlowModal({ flow, onClose }) {
  const { saveFlow, sendTest, instagram, showToast } = useFlows();
  const [form, setForm] = useState({ keyword: flow?.keyword ?? "", message: flow?.message ?? "", name: flow?.name ?? "" });
  const [errors, setErrors] = useState({});
  const [created, setCreated] = useState(null);
  const [tested, setTested] = useState(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.keyword.trim()) next.keyword = "Add the keyword people will comment.";
    if (!form.message.trim()) next.message = "Write the DM they will get.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const keyword = form.keyword.trim().toUpperCase();
    const saved = { ...flow, keyword, message: form.message.trim(), name: form.name.trim() || `${keyword} on any post` };
    const id = saveFlow(saved);
    if (flow?.id) {
      showToast(`Saved "${saved.name}".`);
      onClose();
    } else {
      setCreated({ ...saved, id });
    }
  };

  return (
    <Modal open={!!flow} onClose={onClose}>
      {created ? (
        <div className="text-center">
          <CheckCircle2 size={40} className="mx-auto text-green-600" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900">"{created.name}" is ready</h2>
          <p className="mt-2 text-gray-500">
            {instagram
              ? `Replyloop now answers every comment with ${created.keyword}.`
              : `It starts answering comments with ${created.keyword} as soon as you connect Instagram.`}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                sendTest(created);
                setTested(true);
              }}
              className="rounded-xl border border-gray-200 px-6 py-2.5 font-semibold text-gray-600"
            >
              {tested ? "Test DM sent to you" : "Send a test to myself"}
            </button>
            {instagram ? (
              <button onClick={onClose} className={primary}>
                Done
              </button>
            ) : (
              <Link to="/settings" className={primary}>
                Connect Instagram
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{flow?.id ? "Edit Automation" : "New Automation ✨"}</h2>
            <button onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-gray-500 hover:text-gray-900">
              <X size={16} />
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">When someone comments your keyword, they get your DM.</p>

          <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label htmlFor="keyword" className="text-sm font-medium text-gray-700">When someone comments</label>
                <input id="keyword" className={input} value={form.keyword} onChange={set("keyword")} placeholder="LINK" />
                {errors.keyword && <p className="mt-1 text-sm text-red-600">{errors.keyword}</p>}
              </div>
              <div>
                <label htmlFor="message" className="text-sm font-medium text-gray-700">Send them this DM</label>
                <textarea
                  id="message"
                  rows={4}
                  className={input}
                  value={form.message}
                  onChange={set("message")}
                  placeholder="Here is the link you asked for: https://..."
                />
                {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
              </div>
              <details className="text-sm">
                <summary className="cursor-pointer font-medium text-gray-700">More options</summary>
                <label htmlFor="name" className="mt-3 block text-sm font-medium text-gray-700">Name</label>
                <input
                  id="name"
                  className={input}
                  value={form.name}
                  onChange={set("name")}
                  placeholder={`${form.keyword.trim().toUpperCase() || "KEYWORD"} on any post`}
                />
              </details>
            </div>
            <Preview keyword={form.keyword} message={form.message} />
            <div className="flex justify-end gap-3 md:col-span-2">
              <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-6 py-2.5 font-semibold text-gray-600">
                Cancel
              </button>
              <button type="submit" className={primary}>
                {flow?.id ? "Save changes" : "Create automation"}
              </button>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
}
