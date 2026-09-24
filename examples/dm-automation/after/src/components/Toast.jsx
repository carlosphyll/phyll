import { CheckCircle2 } from "lucide-react";
import { useFlows } from "../data/store.jsx";

// Same look as before. The bounce is gone because the toast now holds an Undo button,
// and a button that keeps moving is hard to hit.
export default function Toast() {
  const { toast, hideToast } = useFlows();
  if (!toast) return null;
  return (
    <div role="status" className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-3 text-white shadow-lg shadow-purple-500/50">
      <CheckCircle2 size={18} />
      <span className="font-medium">{toast.message}</span>
      {toast.action && (
        <button
          onClick={() => {
            toast.action.onClick();
            hideToast();
          }}
          className="rounded-lg bg-white/20 px-3 py-1 text-sm font-semibold"
        >
          {toast.action.label}
        </button>
      )}
    </div>
  );
}
