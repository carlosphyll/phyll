import { createContext, useContext, useState } from "react";
import { Routes, Route, NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, FileText, Users, Package, BarChart3, Plug, Settings, Bell } from "lucide-react";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Quotes from "./pages/Quotes.jsx";
import NewQuote from "./pages/NewQuote.jsx";
import ComingSoon from "./pages/ComingSoon.jsx";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const initialQuotes = [
  { id: "ORC-2026-00128", client: "João da Silva", total: 3480.5, status: "PENDING", date: "2026-09-20" },
  { id: "ORC-2026-00127", client: "Maria Oliveira", total: 1250, status: "APPROVED", date: "2026-09-18" },
  { id: "ORC-2026-00126", client: "Empresa XYZ Ltda", total: 890, status: "DRAFT", date: "2026-09-15" },
];

const nav = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/orcamentos", label: "Orçamentos", icon: FileText },
  { to: "/app/clientes", label: "Clientes", icon: Users },
  { to: "/app/produtos", label: "Produtos", icon: Package },
  { to: "/app/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/app/integracoes", label: "Integrações", icon: Plug },
  { to: "/app/configuracoes", label: "Configurações", icon: Settings },
];

function AppLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white p-6">
        <p className="text-xl font-extrabold">
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Orça Já</span> ✨
        </p>
        <nav className="mt-10 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                  isActive ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30" : "text-slate-400 hover:bg-slate-100"
                }`
              }
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-5 text-white shadow-xl shadow-indigo-500/30">
          <p className="font-bold">Upgrade para o Pro 🚀</p>
          <p className="mt-1 text-sm text-indigo-100">Desbloqueie todo o poder da IA.</p>
          <button className="mt-4 w-full rounded-xl bg-white py-2 text-sm font-bold text-indigo-600">Fazer upgrade</button>
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <header className="flex items-center justify-end gap-4 border-b border-slate-200 bg-white px-8 py-4">
          <button className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
            <Bell size={20} />
          </button>
          <img src="https://i.pravatar.cc/100?img=12" alt="" className="h-9 w-9 rounded-full" />
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [quotes, setQuotes] = useState(initialQuotes);
  const [toast, setToast] = useState(null);
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <AppContext.Provider value={{ quotes, setQuotes, showToast }}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/entrar" element={<Login />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="orcamentos" element={<Quotes />} />
          <Route path="orcamentos/novo" element={<NewQuote />} />
          <Route path="clientes" element={<ComingSoon />} />
          <Route path="produtos" element={<ComingSoon />} />
          <Route path="relatorios" element={<ComingSoon />} />
          <Route path="integracoes" element={<ComingSoon />} />
          <Route path="configuracoes" element={<ComingSoon />} />
        </Route>
      </Routes>
      {toast && (
        <div className="fixed bottom-6 right-6 animate-bounce rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 font-semibold text-white shadow-xl shadow-indigo-500/40">
          {toast}
        </div>
      )}
    </AppContext.Provider>
  );
}
