import { Link } from "react-router-dom";
import { FileText, TrendingUp, DollarSign, Users } from "lucide-react";

const kpis = [
  { icon: FileText, label: "Orçamentos enviados", value: "128", trend: "+12% vs mês anterior" },
  { icon: TrendingUp, label: "Taxa de conversão", value: "34%", trend: "+5% vs mês anterior" },
  { icon: DollarSign, label: "Receita prevista", value: "R$ 48.290", trend: "+18% vs mês anterior" },
  { icon: Users, label: "Clientes ativos", value: "56", trend: "+8% vs mês anterior" },
];

const activity = [
  "João da Silva aprovou o orçamento ORC-2026-00127",
  "Você enviou o orçamento ORC-2026-00128",
  "Maria Oliveira visualizou o orçamento ORC-2026-00126",
];

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Olá, bem-vindo de volta! 👋</h1>
      <p className="mt-2 text-slate-400">Aqui está um resumo do seu negócio hoje.</p>

      <div className="mt-8 grid grid-cols-4 gap-6">
        {kpis.map(({ icon: Icon, label, value, trend }) => (
          <div key={label} className="rounded-2xl bg-white p-6 shadow-xl shadow-indigo-500/10 transition-all duration-300 hover:scale-105">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Icon size={20} />
            </div>
            <p className="mt-4 text-sm text-slate-400">{label}</p>
            <p className="mt-1 text-3xl font-extrabold text-slate-900">{value}</p>
            <p className="mt-2 text-xs font-semibold text-emerald-500">↑ {trend}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-xl shadow-indigo-500/10 lg:col-span-2">
          <h2 className="font-bold text-slate-900">Desempenho</h2>
          <div className="mt-6 flex h-48 items-end gap-3">
            {[40, 65, 50, 80, 72, 95, 88].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-lg bg-gradient-to-t from-indigo-600 to-violet-500" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-xl shadow-indigo-500/10">
          <h2 className="font-bold text-slate-900">Atividade recente</h2>
          <ul className="mt-4 space-y-4 text-sm text-slate-500">
            {activity.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
          <Link to="/app/orcamentos/novo" className="mt-6 block rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-center font-bold text-white">
            Novo orçamento
          </Link>
        </div>
      </div>
    </div>
  );
}
