import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../App.jsx";

const input = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useApp();
  const [mode, setMode] = useState("entrar");
  const [f, setF] = useState({ nome: "", telefone: "", cpf: "", nascimento: "", email: "", senha: "", senha2: "" });
  const set = (key) => (e) => setF({ ...f, [key]: e.target.value });
  const signup = mode === "cadastro";

  const submit = (e) => {
    e.preventDefault();
    setUser({ nome: f.nome.split(" ")[0] || "cliente" });
    navigate("/cardapio");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 px-6 py-12">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white/90 p-10 shadow-2xl backdrop-blur-xl">
        <p className="text-center text-5xl">🍔</p>
        <h1 className="mt-4 text-center text-3xl font-extrabold text-gray-900">{signup ? "Crie sua conta" : "Entre para fazer seu pedido"}</h1>
        <p className="mt-2 text-center text-gray-400">Faça login para continuar</p>
        <div className="mt-8 space-y-4">
          {signup && (
            <>
              <input className={input} placeholder="Nome completo" value={f.nome} onChange={set("nome")} />
              <input className={input} placeholder="Telefone" value={f.telefone} onChange={set("telefone")} />
              <input className={input} placeholder="CPF" value={f.cpf} onChange={set("cpf")} />
              <input className={input} type="date" placeholder="Data de nascimento" value={f.nascimento} onChange={set("nascimento")} />
            </>
          )}
          <input className={input} type="email" placeholder="E-mail" value={f.email} onChange={set("email")} />
          <input className={input} type="password" placeholder="Senha" value={f.senha} onChange={set("senha")} />
          {signup && <input className={input} type="password" placeholder="Confirmar senha" value={f.senha2} onChange={set("senha2")} />}
        </div>
        <button className="mt-8 w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-600 py-4 font-bold text-white shadow-lg shadow-orange-500/40">
          {signup ? "Criar conta" : "Entrar"}
        </button>
        <p className="mt-6 text-center text-sm text-gray-400">
          {signup ? "Já tem conta? " : "Não tem conta? "}
          <button type="button" onClick={() => setMode(signup ? "entrar" : "cadastro")} className="font-bold text-orange-600">
            {signup ? "Entrar" : "Cadastre-se"}
          </button>
        </p>
      </form>
    </div>
  );
}
