import { Link } from "react-router-dom";
import { Zap, Sparkles, ShieldCheck } from "lucide-react";

const features = [
  { icon: Zap, title: "Rápido e fácil", desc: "Crie orçamentos profissionais em poucos cliques, de forma simples e intuitiva." },
  { icon: Sparkles, title: "Inteligência Artificial", desc: "Nossa IA potencializa seus resultados e otimiza cada etapa do processo." },
  { icon: ShieldCheck, title: "Seguro e confiável", desc: "Seus dados protegidos com tecnologia de ponta e total segurança." },
];

export function Hero() {
  return (
    <section id="hero" className="px-6 pb-24 pt-20 text-center">
      <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-600">
        ✨ Orçamentos com Inteligência Artificial
      </span>
      <h1 className="mx-auto mt-8 max-w-4xl bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-6xl font-extrabold leading-tight text-transparent">
        Revolucione a forma como você cria orçamentos
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-xl text-slate-400">
        A plataforma completa e intuitiva que potencializa o seu negócio com o poder da IA. Simples, rápido e eficiente.
      </p>
      <div className="mt-10 flex justify-center gap-4">
        <Link
          to="/entrar"
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 font-bold text-white shadow-xl shadow-indigo-500/30 transition-all duration-300 hover:scale-105"
        >
          Comece grátis
        </Link>
        <a href="#" className="rounded-xl border border-slate-200 bg-white px-8 py-4 font-semibold text-slate-700 transition-all duration-300 hover:scale-105">
          Ver demonstração
        </a>
      </div>
      <p className="mt-8 text-sm text-slate-400">⭐⭐⭐⭐⭐ Mais de 10.000 empresas confiam no Orça Já</p>
    </section>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <p className="text-xl font-extrabold">
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Orça Já</span> ✨
          </p>
          <nav className="flex items-center gap-8 text-sm text-slate-500">
            <a href="#">Recursos</a>
            <a href="#">Preços</a>
            <a href="#">Blog</a>
            <Link to="/entrar" className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2 font-bold text-white">
              Comece grátis
            </Link>
          </nav>
        </div>
      </header>

      <Hero />

      <section className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-4xl font-bold text-slate-900">Tudo o que você precisa em um só lugar</h2>
          <p className="mt-4 text-slate-400">Ferramentas poderosas para levar o seu negócio ao próximo nível.</p>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl bg-white p-8 text-center shadow-xl shadow-indigo-500/10 transition-all duration-300 hover:scale-105">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Icon size={26} />
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900">{title}</h3>
                <p className="mt-3 text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-10 text-center text-sm text-slate-400">© 2026 Orça Já. Todos os direitos reservados.</footer>
    </div>
  );
}
