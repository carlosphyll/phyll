import { Link } from "react-router-dom";
import { Scissors, Sparkles, Crown } from "lucide-react";
import { ADDRESS } from "../App.jsx";

const services = [
  { id: "corte", icon: Scissors, name: "Corte Masculino", price: "R$ 45", desc: "Máquina e tesoura, com acabamento na navalha. Cerca de 40 minutos." },
  { id: "barba", icon: Sparkles, name: "Barba Premium", price: "R$ 35", desc: "Toalha quente e navalha. Cerca de 30 minutos." },
  { id: "combo", icon: Crown, name: "Corte + Barba", price: "R$ 70", desc: "Os dois serviços em sequência. Cerca de 1h10." },
];

export function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden px-6 pb-24 pt-36 text-center">
      <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-amber-500/20 blur-3xl" />
      <div className="absolute -right-24 top-40 h-80 w-80 rounded-full bg-orange-600/20 blur-3xl" />
      <div className="relative mx-auto max-w-4xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-sm text-amber-300">
          ✨ Experiência premium
        </span>
        <h1 className="mt-8 bg-gradient-to-r from-amber-300 via-amber-500 to-orange-500 bg-clip-text text-6xl font-extrabold leading-tight text-transparent">
          Corte e barba no Centro, com horário marcado
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl text-zinc-400">
          Escolha o serviço e o horário em um minuto. A confirmação chega no seu WhatsApp, sem cadastro.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/agendar"
            className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-8 py-4 font-bold text-zinc-950 shadow-lg shadow-amber-500/40 transition-all duration-300 hover:scale-105"
          >
            Agendar horário
          </Link>
          <a href="#servicos" className="rounded-full border border-white/15 bg-white/5 px-8 py-4 font-semibold text-zinc-100 backdrop-blur-md transition-all hover:scale-105">
            Ver serviços e preços
          </a>
        </div>
        <p className="mt-8 text-sm text-zinc-400">📍 {ADDRESS} · Segunda a sábado, das 9h às 19h</p>
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-zinc-950/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="bg-gradient-to-r from-amber-300 to-orange-500 bg-clip-text text-2xl font-extrabold text-transparent">Navalha ✂️</span>
          <nav className="flex items-center gap-8 text-sm text-zinc-400">
            <a href="#servicos">Serviços</a>
            <a href="https://wa.me/5511999990000">WhatsApp</a>
            <Link to="/agendar" className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2 font-bold text-zinc-950">
              Agendar horário
            </Link>
          </nav>
        </div>
      </header>

      <Hero />

      <section id="servicos" className="px-6 py-20">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-4xl font-bold">Nossos serviços 💈</h2>
          <p className="mt-4 text-zinc-400">Preço fechado, sem surpresa no caixa.</p>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {services.map(({ id, icon: Icon, name, price, desc }) => (
              <div key={name} className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md transition-all duration-300 hover:scale-105">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                  <Icon size={26} />
                </div>
                <h3 className="mt-6 text-xl font-bold">{name}</h3>
                <p className="mt-2 text-2xl font-extrabold text-amber-400">{price}</p>
                <p className="mt-3 text-zinc-400">{desc}</p>
                <Link to={`/agendar?servico=${id}`} className="mt-6 inline-block rounded-full border border-amber-400/40 px-5 py-2 text-sm font-bold text-amber-300">
                  Agendar este serviço
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10 text-center text-sm text-zinc-400">
        <p>{ADDRESS} · Segunda a sábado, das 9h às 19h</p>
        <p className="mt-4">© 2026 Navalha Barbearia. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
