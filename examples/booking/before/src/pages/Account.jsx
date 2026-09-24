import { CalendarDays, Gift, Wallet, TrendingUp } from "lucide-react";
import { useApp } from "../App.jsx";

const stats = [
  { label: "Agendamentos", value: "12", change: "+20% vs mês anterior", icon: CalendarDays },
  { label: "Pontos de fidelidade", value: "340", change: "+45 este mês", icon: Gift },
  { label: "Economia", value: "R$ 120", change: "+R$ 30 este mês", icon: Wallet },
];

export default function Account() {
  const { user } = useApp();

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">Bem-vindo de volta, {user?.nome ?? "João"}! 👋</h1>
        <p className="mt-2 text-zinc-500">Aqui está o que está acontecendo com seus agendamentos.</p>

        <div className="mt-10 grid grid-cols-3 gap-6">
          {stats.map(({ label, value, change, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all duration-300 hover:scale-105">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Icon size={22} />
              </div>
              <p className="mt-4 text-sm text-zinc-500">{label}</p>
              <p className="mt-1 text-3xl font-extrabold">{value}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-green-400">
                <TrendingUp size={12} /> {change}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
          <h2 className="text-xl font-bold">Próximo agendamento</h2>
          <p className="mt-3 text-zinc-300">Corte + Barba · 15/10 às 10:00 com Bruno</p>
          <div className="mt-6 flex gap-3">
            <button onClick={() => {}} className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 font-bold text-zinc-950">
              Remarcar
            </button>
            <button onClick={() => alert("Em breve!")} className="rounded-xl border border-white/10 px-6 py-3 font-semibold text-zinc-300">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
