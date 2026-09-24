import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../App.jsx";

const input = "mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-zinc-100 outline-none placeholder:text-zinc-600";
const label = "text-sm text-zinc-400";

export default function Signup() {
  const navigate = useNavigate();
  const { setUser } = useApp();
  const [f, setF] = useState({
    nome: "",
    email: "",
    email2: "",
    senha: "",
    senha2: "",
    telefone: "",
    cpf: "",
    nascimento: "",
    genero: "",
    origem: "",
    termos: false,
    novidades: false,
  });
  const set = (key) => (e) => setF({ ...f, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const valid =
    f.nome && f.email && f.email === f.email2 && f.senha.length >= 8 && f.senha === f.senha2 && f.telefone && f.cpf.length >= 11 && f.nascimento && f.genero && f.termos;

  const submit = (e) => {
    e.preventDefault();
    setUser({ nome: f.nome.split(" ")[0] });
    navigate("/agendar");
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-16">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-amber-500/10 backdrop-blur-xl">
        <h1 className="text-center text-3xl font-bold text-zinc-100">Crie sua conta para agendar ✂️</h1>
        <p className="mt-2 text-center text-zinc-500">Preencha seus dados para ter acesso à melhor experiência.</p>
        <form onSubmit={submit} className="mt-8 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={label}>Nome completo</label>
            <input className={input} value={f.nome} onChange={set("nome")} />
          </div>
          <div>
            <label className={label}>E-mail</label>
            <input type="email" className={input} value={f.email} onChange={set("email")} />
          </div>
          <div>
            <label className={label}>Confirmar e-mail</label>
            <input type="email" className={input} value={f.email2} onChange={set("email2")} />
          </div>
          <div>
            <label className={label}>Senha</label>
            <input type="password" className={input} value={f.senha} onChange={set("senha")} />
          </div>
          <div>
            <label className={label}>Confirmar senha</label>
            <input type="password" className={input} value={f.senha2} onChange={set("senha2")} />
          </div>
          <div>
            <label className={label}>Telefone</label>
            <input className={input} value={f.telefone} onChange={set("telefone")} placeholder="(11) 99999-9999" />
          </div>
          <div>
            <label className={label}>CPF</label>
            <input className={input} value={f.cpf} onChange={set("cpf")} placeholder="000.000.000-00" />
          </div>
          <div>
            <label className={label}>Data de nascimento</label>
            <input type="date" className={input} value={f.nascimento} onChange={set("nascimento")} />
          </div>
          <div>
            <label className={label}>Gênero</label>
            <select className={input} value={f.genero} onChange={set("genero")}>
              <option value="">Selecione</option>
              <option>Masculino</option>
              <option>Feminino</option>
              <option>Outro</option>
              <option>Prefiro não dizer</option>
            </select>
          </div>
          <div className="col-span-2">
            <label className={label}>Como nos conheceu?</label>
            <select className={input} value={f.origem} onChange={set("origem")}>
              <option value="">Selecione</option>
              <option>Instagram</option>
              <option>Google</option>
              <option>Indicação</option>
              <option>Passando na rua</option>
            </select>
          </div>
          <label className="col-span-2 flex items-center gap-2 text-sm text-zinc-400">
            <input type="checkbox" checked={f.termos} onChange={set("termos")} /> Aceito os termos de uso e a política de privacidade
          </label>
          <label className="col-span-2 flex items-center gap-2 text-sm text-zinc-400">
            <input type="checkbox" checked={f.novidades} onChange={set("novidades")} /> Quero receber novidades e promoções
          </label>
          <button
            disabled={!valid}
            className="col-span-2 mt-4 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 py-4 font-bold text-zinc-950 shadow-lg shadow-amber-500/40 disabled:opacity-30"
          >
            Cadastrar
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-500">
          Já tem conta? <a href="#" className="text-amber-400">Entrar</a>
        </p>
      </div>
    </div>
  );
}
