import { Link, Navigate } from "react-router-dom";
import { ADDRESS, services, useApp } from "../App.jsx";

const pad = (n) => String(n).padStart(2, "0");

// A calendar file, so the appointment lands in the phone's own calendar.
function downloadIcs(start, minutes, title) {
  const end = new Date(start.getTime() + minutes * 60000);
  const stamp = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${title}`,
    `LOCATION:${ADDRESS}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  link.download = "agendamento-navalha.ics";
  link.click();
}

export default function Done() {
  const { booking } = useApp();
  if (!booking) return <Navigate to="/agendar" replace />;

  const service = services.find((s) => s.id === booking.service);
  const start = new Date(booking.date);
  const [h, m] = booking.time.split(":").map(Number);
  start.setHours(h, m, 0, 0);
  const day = start.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  const minutes = service.id === "combo" ? 70 : service.id === "corte" ? 40 : 30;

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-amber-500/10 backdrop-blur-xl">
        <p className="text-sm font-bold text-amber-400">Agendado ✂️</p>
        <h1 className="mt-2 text-3xl font-bold">
          {service.name}, {day}, às {booking.time}
        </h1>
        <p className="mt-2 text-zinc-400">
          Com {booking.barber} · {ADDRESS}
        </p>
        <p className="mt-6 text-zinc-300">
          {booking.name.split(" ")[0]}, enviamos a confirmação para o WhatsApp {booking.phone}. Um dia antes, você recebe um lembrete.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={() => downloadIcs(start, minutes, `${service.name} na Navalha`)}
            className="rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 font-bold text-zinc-950 shadow-lg shadow-amber-500/40"
          >
            Adicionar à agenda
          </button>
          <Link to={`/agendar?servico=${service.id}`} className="rounded-xl border border-white/10 px-6 py-3 font-semibold text-zinc-300">
            Remarcar
          </Link>
          <a href="https://wa.me/5511999990000" className="rounded-xl border border-white/10 px-6 py-3 font-semibold text-zinc-300">
            Falar com a barbearia
          </a>
        </div>
      </div>
    </div>
  );
}
