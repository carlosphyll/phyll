import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { ADDRESS, barbers, services, useApp } from "../App.jsx";

const TIMES = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];
const input =
  "mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-zinc-100 outline-none placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-amber-400";

// Free slots for a day. Past times are gone on the current day.
function freeTimes(date) {
  const now = new Date();
  const today = date.toDateString() === now.toDateString();
  return TIMES.filter((t, i) => {
    if ((i + date.getDate()) % 3 === 0) return false;
    if (!today) return true;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m > now.getHours() * 60 + now.getMinutes();
  });
}

// The next days that still have a free time. The shop is closed on Sundays,
// and a day with nothing left is not offered, so the first day shown always works.
function openDays(count) {
  const days = [];
  const d = new Date();
  while (days.length < count) {
    if (d.getDay() !== 0 && freeTimes(d).length > 0) days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function dayLabel(date) {
  const short = date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === new Date().toDateString()) return `Hoje, ${short}`;
  if (date.toDateString() === tomorrow.toDateString()) return `Amanhã, ${short}`;
  return short;
}

const choice = (active) =>
  `rounded-2xl border p-5 text-left transition-all duration-300 hover:scale-105 ${
    active ? "border-amber-400 bg-amber-400/10" : "border-white/10 bg-white/5"
  }`;
const chip = (active) =>
  `rounded-lg px-3 py-2 text-sm ${active ? "bg-amber-400 font-bold text-zinc-950" : "bg-white/5 text-zinc-200"}`;

export default function Booking() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { booking, setBooking } = useApp();
  const days = useMemo(() => openDays(4), []);
  const [form, setForm] = useState({ service: params.get("servico") ?? "", day: 0, time: "", barber: "", name: booking?.name ?? "", phone: booking?.phone ?? "" });
  const [errors, setErrors] = useState({});
  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const free = freeTimes(days[form.day]);
  const service = services.find((s) => s.id === form.service);

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.service) next.service = "Escolha o serviço.";
    if (!form.time) next.time = "Escolha um horário.";
    if (!form.name.trim()) next.name = "Diga seu nome para a gente te chamar.";
    if (form.phone.replace(/\D/g, "").length < 10) next.phone = "Informe o WhatsApp com DDD para receber a confirmação.";
    setErrors(next);
    // Bring the first problem into view, so the person sees what is missing.
    requestAnimationFrame(() => document.querySelector("[role=alert]")?.scrollIntoView({ block: "center" }));
    if (Object.keys(next).length) return;
    const barber = form.barber || barbers[(form.day + TIMES.indexOf(form.time)) % barbers.length];
    setBooking({ ...form, barber, date: days[form.day].toISOString() });
    navigate("/agendado");
  };

  const error = (key) => errors[key] && <p role="alert" className="mt-2 text-sm font-medium text-red-400">{errors[key]}</p>;

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-1 py-1 text-sm text-zinc-400 hover:text-zinc-100">
          <ChevronLeft size={16} /> Voltar
        </Link>
        <h1 className="mt-4 text-3xl font-bold">Agendar horário ✂️</h1>
        <p className="mt-2 text-zinc-400">Navalha Barbearia · {ADDRESS}</p>

        <form
          onSubmit={submit}
          noValidate
          className="mt-8 space-y-10 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-amber-500/10 backdrop-blur-xl"
        >
          <fieldset>
            <legend className="text-lg font-bold">1. Serviço</legend>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {services.map((s) => (
                <button type="button" key={s.id} onClick={() => set("service", s.id)} aria-pressed={form.service === s.id} className={choice(form.service === s.id)}>
                  <p className="font-semibold">{s.name}</p>
                  <p className="mt-2 text-xl font-extrabold text-amber-400">{s.price}</p>
                  <p className="text-sm text-zinc-400">{s.duration}</p>
                </button>
              ))}
            </div>
            {error("service")}
          </fieldset>

          <fieldset>
            <legend className="text-lg font-bold">2. Horário</legend>
            <div className="mt-4 flex flex-wrap gap-2">
              {days.map((d, i) => (
                <button type="button" key={d.toISOString()} onClick={() => setForm({ ...form, day: i, time: "" })} aria-pressed={form.day === i} className={chip(form.day === i)}>
                  {dayLabel(d)}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {free.map((t) => (
                <button type="button" key={t} onClick={() => set("time", t)} aria-pressed={form.time === t} className={chip(form.time === t)}>
                  {t}
                </button>
              ))}
            </div>
            {error("time")}
            <label htmlFor="barber" className="mt-6 block text-sm text-zinc-400">
              Profissional (opcional)
            </label>
            <select id="barber" className={`${input} bg-zinc-900 sm:w-80`} value={form.barber} onChange={(e) => set("barber", e.target.value)}>
              <option value="">Qualquer um, o primeiro disponível</option>
              {barbers.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </fieldset>

          <fieldset>
            <legend className="text-lg font-bold">3. Seus dados</legend>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="text-sm text-zinc-400">Nome</label>
                <input id="name" className={input} value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="given-name" />
                {error("name")}
              </div>
              <div>
                <label htmlFor="phone" className="text-sm text-zinc-400">WhatsApp</label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(11) 99999-9999"
                  className={input}
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                />
                {error("phone")}
              </div>
            </div>
            <p className="mt-3 text-sm text-zinc-400">A confirmação chega no seu WhatsApp. Não precisa criar conta.</p>
          </fieldset>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
            <p className="text-zinc-300">
              {service ? `${service.name}, ${service.price}` : "Escolha o serviço"}
              {form.time ? ` · ${dayLabel(days[form.day])} às ${form.time}` : ""}
            </p>
            <button type="submit" className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-8 py-3 font-bold text-zinc-950 shadow-lg shadow-amber-500/40">
              Confirmar agendamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
