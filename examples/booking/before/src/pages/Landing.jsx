import { Link } from "react-router-dom";
import { Scissors, Sparkles, Crown } from "lucide-react";

const services = [
  { icon: Scissors, name: "Corte Masculino", price: "R$ 45", desc: "Cortes modernos com acabamento impecável e atenção a cada detalhe." },
  { icon: Sparkles, name: "Barba Premium", price: "R$ 35", desc: "Toalha quente, navalha e produtos exclusivos para uma experiência única." },
  { icon: Crown, name: "Corte + Barba", price: "R$ 70", desc: "O combo completo para quem não abre mão do melhor." },
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
          Transforme seu visual com a melhor experiência premium da cidade
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl text-zinc-500">
          Cortes modernos, atendimento de excelência e um ambiente pensado para você. Tudo em um só lugar.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            to="/cadastro"
            className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-8 py-4 font-bold text-zinc-950 shadow-lg shadow-amber-500/40 transition-all duration-300 hover:scale-105"
          >
            Agende agora
          </Link>
          <a href="#" className="rounded-full border border-white/15 bg-white/5 px-8 py-4 font-semibold text-zinc-100 backdrop-blur-md transition-all hover:scale-105">
            Saiba mais
          </a>
        </div>
        <p className="mt-8 text-sm text-zinc-500">⭐ 4.9/5 · Mais de 5.000 clientes satisfeitos</p>
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
            <a href="#">Serviços</a>
            <a href="#">Sobre</a>
            <a href="#">Contato</a>
            <Link to="/cadastro" className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2 font-bold text-zinc-950">
              Agende agora
            </Link>
          </nav>
        </div>
      </header>

      <Hero />

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-4xl font-bold">Nossos serviços 💈</h2>
          <p className="mt-4 text-zinc-500">Tudo o que você precisa para elevar seu estilo ao próximo nível.</p>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {services.map(({ icon: Icon, name, price, desc }) => (
              <div key={name} className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md transition-all duration-300 hover:scale-105">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                  <Icon size={26} />
                </div>
                <h3 className="mt-6 text-xl font-bold">{name}</h3>
                <p className="mt-2 text-2xl font-extrabold text-amber-400">{price}</p>
                <p className="mt-3 text-zinc-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10 text-center text-sm text-zinc-500">
        <div className="flex justify-center gap-6">
          <a href="#">Política de privacidade</a>
          <a href="#">Termos de uso</a>
        </div>
        <p className="mt-4">© 2026 Navalha Barbearia. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
