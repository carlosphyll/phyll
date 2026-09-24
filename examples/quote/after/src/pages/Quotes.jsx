import { Link } from "react-router-dom";
import { FileText, CheckCircle2, Wallet } from "lucide-react";
import { useApp } from "../App.jsx";
import { brl, statusOf, totalOf } from "../QuoteDocument.jsx";

const primary = "rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3 font-bold text-white shadow-lg shadow-indigo-500/30";

export default function Quotes() {
  const { quotes } = useApp();

  if (quotes.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-xl shadow-indigo-500/10 md:p-16">
        <p className="text-5xl">📄</p>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Nenhum orçamento ainda</h1>
        <p className="mt-2 text-slate-600">Escreva os itens, confira o total e mande pelo WhatsApp. Leva um minuto.</p>
        <Link to="/novo" className={`mt-8 inline-block ${primary}`}>
          Fazer o primeiro orçamento
        </Link>
      </div>
    );
  }

  const approved = quotes.filter((q) => q.approved);
  const kpis = [
    { icon: FileText, label: "Orçamentos feitos", value: quotes.length },
    { icon: CheckCircle2, label: "Aprovados", value: approved.length },
    { icon: Wallet, label: "Total aprovado", value: brl(approved.reduce((sum, q) => sum + totalOf(q), 0)) },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Orçamentos</h1>

      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        {kpis.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-2xl bg-white p-6 shadow-xl shadow-indigo-500/10">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Icon size={20} />
            </div>
            <p className="mt-4 text-sm text-slate-600">{label}</p>
            <p className="mt-1 text-3xl font-extrabold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white p-6 shadow-xl shadow-indigo-500/10">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="text-xs uppercase text-slate-500">
            <tr>
              <th className="py-3 font-semibold">Nº</th>
              <th className="font-semibold">Cliente</th>
              <th className="font-semibold">Valor</th>
              <th className="font-semibold">Situação</th>
              <th className="font-semibold">Data</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => {
              const status = statusOf(q);
              return (
                <tr key={q.id} className="border-t border-slate-100">
                  <td className="py-4 text-slate-600">{q.number}</td>
                  <td className="font-medium text-slate-900">{q.client}</td>
                  <td className="text-slate-700">{brl(totalOf(q))}</td>
                  <td>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${status.className}`}>{status.label}</span>
                  </td>
                  <td className="text-slate-600">{new Date(q.createdAt).toLocaleDateString("pt-BR")}</td>
                  <td className="text-right">
                    <Link to={`/orcamentos/${q.id}`} className="rounded-lg px-3 py-2 font-semibold text-indigo-600 hover:bg-indigo-50">
                      Abrir
                    </Link>
                    <Link to={`/novo?de=${q.id}`} className="rounded-lg px-3 py-2 font-semibold text-slate-600 hover:bg-slate-100">
                      Duplicar
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
