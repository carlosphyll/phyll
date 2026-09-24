import { CheckCircle2 } from "lucide-react";
import { useFlows } from "../data/store.jsx";

export default function Toast() {
  const { toast } = useFlows();
  if (!toast) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-3 text-white shadow-lg shadow-purple-500/50 animate-bounce">
      <CheckCircle2 size={18} />
      <span className="font-medium">{toast}</span>
    </div>
  );
}
