import { Link } from "react-router-dom";
import { Flame, Clock, Wallet } from "lucide-react";
import { STORE } from "../menu.js";

const reasons = [
  { icon: Flame, title: "Feito na brasa", desc: "Blend de 160 g grelhado na hora, no carvão." },
  { icon: Clock, title: "Entrega em 30 a 45 min", desc: "Taxa fixa de R$ 8,00 na Vila Nova e no Centro." },
  { icon: Wallet, title: "Pague na entrega", desc: "Pix, cartão ou dinheiro. Sem cadastro e sem cartão no site." },
];

export function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden px-6 pb-24 pt-20 text-center">
      <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-orange-300/40 blur-3xl" />
      <div className="absolute -right-20 top-32 h-72 w-72 rounded-full bg-red-300/40 blur-3xl" />
      <div className="relative mx-auto max-w-4xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-semibold text-orange-700 backdrop-blur-md">
          🔥 {STORE.hours}
        </span>
        <h1 className="mt-8 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-6xl font-extrabold leading-tight text-transparent">
          Hambúrguer na brasa, entregue em 30 a 45 minutos
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-600">
          Escolha no cardápio e peça em poucos toques, sem cadastro. Você paga na entrega, com Pix, cartão ou dinheiro.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/cardapio"
            className="rounded-2xl bg-gradient-to-r from-orange-700 to-red-600 px-8 py-4 font-bold text-white shadow-2xl shadow-orange-500/40 transition-all duration-300 hover:scale-105"
          >
            Ver cardápio e pedir
          </Link>
          <a href="#onde-fica" className="rounded-2xl bg-white px-8 py-4 font-semibold text-gray-700 shadow-lg transition-all duration-300 hover:scale-105">
            Onde fica
          </a>
        </div>
        <p className="mt-8 text-sm text-gray-600">📍 {STORE.address} · Entrega na Vila Nova e no Centro</p>
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-orange-50">
      <header className="sticky top-0 z-40 border-b border-orange-100 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-2xl font-extrabold text-transparent">Brasa Burger 🔥</span>
          <nav className="flex items-center gap-6 text-sm text-gray-600">
            <a href="#onde-fica" className="py-2">
              Onde fica
            </a>
            <Link to="/cardapio" className="rounded-xl bg-gradient-to-r from-orange-700 to-red-600 px-5 py-2 font-bold text-white">
              Ver cardápio
            </Link>
          </nav>
        </div>
      </header>

      <Hero />

      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {reasons.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-3xl bg-white p-8 text-center shadow-2xl shadow-orange-500/10 transition-all duration-300 hover:scale-105">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                <Icon size={26} />
              </div>
              <h3 className="mt-6 text-xl font-bold text-gray-900">{title}</h3>
              <p className="mt-3 text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer id="onde-fica" className="py-10 text-center text-sm text-gray-600">
        <p className="font-semibold text-gray-900">{STORE.address}</p>
        <p className="mt-1">{STORE.hours}</p>
        <a href={`https://wa.me/${STORE.whatsapp}`} className="mt-3 inline-block py-2 font-bold text-orange-700">
          Falar no WhatsApp
        </a>
        <p className="mt-4">© 2026 Brasa Burger</p>
      </footer>
    </div>
  );
}
