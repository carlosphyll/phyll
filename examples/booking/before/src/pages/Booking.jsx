import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useApp } from "../App.jsx";

const units = [{ id: "centro", name: "Unidade Centro", address: "Rua das Flores, 120" }];
const services = [
  { id: "corte", name: "Corte Masculino", price: "R$ 45", duration: "40 min" },
  { id: "barba", name: "Barba Premium", price: "R$ 35", duration: "30 min" },
  { id: "combo", name: "Corte + Barba", price: "R$ 70", duration: "1h10" },
];
const barbers = [
  { id: "rafael", name: "Rafael", avatar: "https://i.pravatar.cc/150?img=13" },
  { id: "bruno", name: "Bruno", avatar: "https://i.pravatar.cc/150?img=59" },
  { id: "diego", name: "Diego", avatar: "https://i.pravatar.cc/150?img=68" },
];
const days = Array.from({ length: 30 }, (_, i) => i + 1);
const closed = new Set([6, 7, 13, 14, 20, 21, 27, 28]);
const times = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];
const busy = new Set(["09:00", "10:30", "14:00", "15:30", "16:00"]);

const card = (active) =>
  `cursor-pointer rounded-2xl border p-6 text-left transition-all duration-300 hover:scale-105 ${
    active ? "border-amber-400 bg-amber-400/10" : "border-white/10 bg-white/5"
  }`;

export default function Booking() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [step, setStep] = useState(1);
  const [b, setB] = useState({ unit: "", service: "", barber: "", day: 0, time: "", notes: "", coupon: "", payment: "", policy: false });
  const set = (key, value) => setB({ ...b, [key]: value });
  const canNext = { 1: b.unit, 2: b.service, 3: b.barber, 4: b.day && b.time, 5: b.payment && b.policy }[step];

  const confirmBooking = () => {
    if (!window.confirm("Tem certeza que deseja confirmar o agendamento?")) return;
    showToast("Sucesso!");
    navigate("/minha-conta");
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100">
      <div className="mx-auto max-w-3xl">
        <p className="text-center text-sm text-amber-400">Etapa {step} de 5</p>
        <div className="mt-3 h-2 rounded-full bg-white/10">
          <div className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${step * 20}%` }} />
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-amber-500/10 backdrop-blur-xl">
          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold">Escolha a unidade</h1>
              <div className="mt-6 grid gap-4">
                {units.map((u) => (
                  <button key={u.id} onClick={() => set("unit", u.id)} className={card(b.unit === u.id)}>
                    <p className="flex items-center gap-2 font-semibold">
                      <MapPin size={16} className="text-amber-400" /> {u.name}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">{u.address}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-2xl font-bold">Escolha o serviço</h1>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {services.map((s) => (
                  <button key={s.id} onClick={() => set("service", s.id)} className={card(b.service === s.id)}>
                    <p className="font-semibold">{s.name}</p>
                    <p className="mt-2 text-xl font-extrabold text-amber-400">{s.price}</p>
                    <p className="text-sm text-zinc-500">{s.duration}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="text-2xl font-bold">Escolha o profissional</h1>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {barbers.map((p) => (
                  <button key={p.id} onClick={() => set("barber", p.id)} className={card(b.barber === p.id)}>
                    <img src={p.avatar} alt="" className="h-16 w-16 rounded-full" />
                    <p className="mt-3 font-semibold">{p.name}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h1 className="text-2xl font-bold">Escolha a data e o horário</h1>
              <p className="mt-6 text-sm text-zinc-400">Setembro de 2026</p>
              <div className="mt-3 grid grid-cols-7 gap-2">
                {days.map((d) => (
                  <button
                    key={d}
                    disabled={closed.has(d) || d < 23}
                    onClick={() => set("day", d)}
                    className={`rounded-lg py-2 text-sm disabled:text-zinc-700 ${b.day === d ? "bg-amber-400 font-bold text-zinc-950" : "bg-white/5"}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              {b.day > 0 && (
                <div className="mt-6 grid grid-cols-4 gap-2">
                  {times.map((t) => (
                    <button
                      key={t}
                      disabled={busy.has(t)}
                      onClick={() => set("time", t)}
                      className={`rounded-lg py-2 text-sm disabled:line-through disabled:opacity-30 ${b.time === t ? "bg-amber-400 font-bold text-zinc-950" : "bg-white/5"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 5 && (
            <>
              <h1 className="text-2xl font-bold">Revise e confirme</h1>
              <p className="mt-4 text-zinc-400">
                {services.find((s) => s.id === b.service)?.name} com {barbers.find((p) => p.id === b.barber)?.name}, dia {b.day}/09 às {b.time}
              </p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm text-zinc-400">Observações</label>
                  <textarea className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none" value={b.notes} onChange={(e) => set("notes", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-zinc-400">Cupom de desconto</label>
                  <input className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none" value={b.coupon} onChange={(e) => set("coupon", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-zinc-400">Forma de pagamento</label>
                  <select className="mt-1 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 outline-none" value={b.payment} onChange={(e) => set("payment", e.target.value)}>
                    <option value="">Selecione</option>
                    <option>Pix</option>
                    <option>Cartão de crédito</option>
                    <option>Dinheiro</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm text-zinc-400">
                  <input type="checkbox" checked={b.policy} onChange={(e) => set("policy", e.target.checked)} /> Li e aceito a política de cancelamento
                </label>
              </div>
            </>
          )}

          <div className="mt-10 flex justify-between">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="rounded-xl border border-white/10 px-6 py-3 font-semibold text-zinc-300">
                Voltar
              </button>
            ) : (
              <span />
            )}
            <button
              disabled={!canNext}
              onClick={step < 5 ? () => setStep(step + 1) : confirmBooking}
              className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-8 py-3 font-bold text-zinc-950 disabled:opacity-30"
            >
              {step < 5 ? "Próximo" : "Confirmar agendamento"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
