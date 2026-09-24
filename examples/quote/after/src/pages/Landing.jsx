import { Link, Navigate } from "react-router-dom";
import { PencilLine, Calculator, Send } from "lucide-react";
import { useApp } from "../App.jsx";

const steps = [
  { icon: PencilLine, title: "1. Escreva os itens", desc: "Descrição, quantidade e valor. Coloque quantos itens quiser." },
  { icon: Calculator, title: "2. Confira o total", desc: "O documento se monta ao lado, com total e validade, do jeito que o cliente vai ver." },
  { icon: Send, title: "3. Envie", desc: "Pelo WhatsApp, com a mensagem pronta, ou em PDF para mandar por e-mail." },
];

export function Hero() {
  return (
    <section id="hero" className="px-6 pb-24 pt-20 text-center">
      <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-semibold text-indigo-600">✨ Grátis e sem cadastro</span>
      <h1 className="mx-auto mt-8 max-w-4xl bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-6xl font-extrabold leading-tight text-transparent">
        Faça o orçamento e mande pelo WhatsApp em um minuto
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-xl text-slate-600">
        Escreva o nome do cliente e os itens. O Orça Já soma o total, monta o documento e abre o WhatsApp com a mensagem pronta.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          to="/novo"
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 font-bold text-white shadow-xl shadow-indigo-500/30 transition-all duration-300 hover:scale-105"
        >
          Fazer um orçamento
        </Link>
        <a
          href="#como-funciona"
          className="rounded-xl border border-slate-200 bg-white px-8 py-4 font-semibold text-slate-700 transition-all duration-300 hover:scale-105"
        >
          Ver como funciona
        </a>
      </div>
      <p className="mt-8 text-sm text-slate-600">Seus orçamentos ficam salvos neste aparelho.</p>
    </section>
  );
}

export default function Landing() {
  const { quotes } = useApp();
  // Whoever already made a quote came back to work, not to read the pitch again.
  if (quotes.length > 0) return <Navigate to="/orcamentos" replace />;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <p className="text-xl font-extrabold">
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Orça Já</span> ✨
          </p>
          <nav className="flex items-center gap-6 text-sm text-slate-600">
            <a href="#como-funciona" className="py-2">
              Como funciona
            </a>
            <Link to="/novo" className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2 font-bold text-white">
              Fazer um orçamento
            </Link>
          </nav>
        </div>
      </header>

      <Hero />

      <section id="como-funciona" className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-4xl font-bold text-slate-900">Como funciona</h2>
          <p className="mt-4 text-slate-600">Três passos, do pedido do cliente ao orçamento enviado.</p>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {steps.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl bg-white p-8 text-center shadow-xl shadow-indigo-500/10 transition-all duration-300 hover:scale-105">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Icon size={26} />
                </div>
                <h3 className="mt-6 text-xl font-bold text-slate-900">{title}</h3>
                <p className="mt-3 text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
          <Link
            to="/novo"
            className="mt-14 inline-block rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-4 font-bold text-white shadow-xl shadow-indigo-500/30"
          >
            Fazer um orçamento
          </Link>
        </div>
      </section>

      <footer className="py-10 text-center text-sm text-slate-600">© 2026 Orça Já</footer>
    </div>
  );
}
