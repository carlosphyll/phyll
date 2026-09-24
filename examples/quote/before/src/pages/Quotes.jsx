import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Trash2, Search, Download } from "lucide-react";
import { useApp } from "../App.jsx";

const brl = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Quotes() {
  const { quotes, setQuotes } = useApp();
  const [query, setQuery] = useState("");
  const list = quotes.filter((q) => q.client.toLowerCase().includes(query.toLowerCase()));

  const remove = (id) => {
    if (!window.confirm("Tem certeza?")) return;
    setQuotes(quotes.filter((q) => q.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Orçamentos</h1>
        <div className="flex gap-3">
          <button
            onClick={() => alert("Em breve!")}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"
          >
            <Download size={16} /> Exportar
          </button>
          <Link
            to="/app/orcamentos/novo"
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30"
          >
            + Novo Orçamento
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-xl shadow-indigo-500/10">
        <div className="relative w-72">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none"
          />
        </div>

        {list.length === 0 ? (
          <p className="py-16 text-center text-slate-400">Nenhum dado encontrado</p>
        ) : (
          <table className="mt-6 w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-400">
              <tr>
                <th className="py-3">Código</th>
                <th>Cliente</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Data</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.map((q) => (
                <tr key={q.id} className="group border-t border-slate-100">
                  <td className="py-4 font-mono text-slate-500">{q.id}</td>
                  <td className="font-medium text-slate-900">{q.client}</td>
                  <td className="text-slate-700">{brl(q.total)}</td>
                  <td>
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">{q.status}</span>
                  </td>
                  <td className="text-slate-400">{q.date}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                        <Eye size={16} />
                      </button>
                      <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => remove(q.id)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
