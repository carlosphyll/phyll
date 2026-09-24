import { Link } from "react-router-dom";
import { Flame, Clock, Heart } from "lucide-react";

const reasons = [
  { icon: Flame, title: "Feito na brasa", desc: "Sabor inigualável que conquista a todos em cada mordida." },
  { icon: Clock, title: "Entrega rápida", desc: "Seu pedido chega quentinho e no tempo certo, sempre." },
  { icon: Heart, title: "Feito com amor", desc: "Ingredientes selecionados para uma experiência única." },
];

export function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden px-6 pb-24 pt-20 text-center">
      <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-orange-300/40 blur-3xl" />
      <div className="absolute -right-20 top-32 h-72 w-72 rounded-full bg-red-300/40 blur-3xl" />
      <div className="relative mx-auto max-w-4xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-semibold text-orange-600 backdrop-blur-md">
          🔥 O melhor burger da cidade
        </span>
        <h1 className="mt-8 bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-6xl font-extrabold leading-tight text-transparent">
          Sabor que conquista, experiência que encanta
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-400">
          Hambúrgueres artesanais preparados com paixão para transformar o seu dia. Uma explosão de sabor em cada mordida.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            to="/entrar"
            className="rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 px-8 py-4 font-bold text-white shadow-2xl shadow-orange-500/40 transition-all duration-300 hover:scale-105"
          >
            Peça agora
          </Link>
          <a href="#" className="rounded-2xl bg-white px-8 py-4 font-semibold text-gray-700 shadow-lg transition-all duration-300 hover:scale-105">
            Saiba mais
          </a>
        </div>
        <p className="mt-8 text-sm text-gray-400">⭐ 4.9 · Mais de 50 mil pedidos entregues</p>
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-orange-50">
      <header className="sticky top-0 z-40 border-b border-orange-100 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-2xl font-extrabold text-transparent">Brasa Burger 🔥</span>
          <nav className="flex items-center gap-8 text-sm text-gray-500">
            <a href="#">Cardápio</a>
            <a href="#">Sobre</a>
            <a href="#">Contato</a>
            <Link to="/entrar" className="rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-5 py-2 font-bold text-white">
              Peça agora
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
              <p className="mt-3 text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="py-10 text-center text-sm text-gray-400">© 2026 Brasa Burger. Todos os direitos reservados.</footer>
    </div>
  );
}
