import { useNavigate } from "react-router-dom";

const input = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-xl shadow-indigo-500/10">
        <p className="text-2xl font-extrabold">
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Orça Já</span> ✨
        </p>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Bem-vindo de volta! 👋</h1>
        <p className="mt-2 text-slate-400">Entre na sua conta para continuar</p>
        <form
          className="mt-8 space-y-4 text-left"
          onSubmit={(e) => {
            e.preventDefault();
            navigate("/app");
          }}
        >
          <input className={input} type="email" placeholder="Seu e-mail" />
          <input className={input} type="password" placeholder="Sua senha" />
          <a href="#" className="block text-right text-sm text-indigo-600">
            Esqueceu a senha?
          </a>
          <button className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 font-bold text-white shadow-lg shadow-indigo-500/30">Entrar</button>
          <button type="button" className="w-full rounded-xl border border-slate-200 py-3 font-semibold text-slate-700">
            Entrar com Google
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-400">
          Não tem conta? <a href="#" className="font-semibold text-indigo-600">Criar conta</a>
        </p>
      </div>
    </div>
  );
}
