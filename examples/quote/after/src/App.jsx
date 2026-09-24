import { createContext, useContext, useEffect, useState } from "react";
import { Routes, Route, NavLink, Outlet, Navigate, Link } from "react-router-dom";
import { FilePlus2, FileText } from "lucide-react";
import Landing from "./pages/Landing.jsx";
import NewQuote from "./pages/NewQuote.jsx";
import Quotes from "./pages/Quotes.jsx";
import QuoteView from "./pages/QuoteView.jsx";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

// Quotes and the sender's name stay on this device, so there is nothing to sign up for.
function useStored(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Private windows can refuse storage. The app still works; it forgets on reload.
    }
  }, [key, value]);
  return [value, setValue];
}

const nav = [
  { to: "/novo", label: "Novo orçamento", short: "Novo", icon: FilePlus2 },
  { to: "/orcamentos", label: "Orçamentos", short: "Orçamentos", icon: FileText },
];

const navClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
    isActive ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30" : "text-slate-600 hover:bg-slate-100"
  }`;

function Logo() {
  return (
    <Link to="/" className="text-xl font-extrabold">
      <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Orça Já</span> ✨
    </Link>
  );
}

function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-6 md:block print:hidden">
        <Logo />
        <nav className="mt-10 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={navClass}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <header className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3 md:hidden print:hidden">
        <Logo />
        <nav className="flex gap-1">
          {nav.map(({ to, short }) => (
            <NavLink key={to} to={to} className={navClass}>
              {short}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="min-w-0 flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  const [quotes, setQuotes] = useStored("orcaja.quotes", []);
  const [sender, setSender] = useStored("orcaja.sender", "");
  const saveQuote = (quote) => setQuotes((list) => [quote, ...list.filter((q) => q.id !== quote.id)]);
  const updateQuote = (id, changes) => setQuotes((list) => list.map((q) => (q.id === id ? { ...q, ...changes } : q)));

  return (
    <AppContext.Provider value={{ quotes, saveQuote, updateQuote, sender, setSender }}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<AppLayout />}>
          <Route path="/novo" element={<NewQuote />} />
          <Route path="/orcamentos" element={<Quotes />} />
          <Route path="/orcamentos/:id" element={<QuoteView />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppContext.Provider>
  );
}
