import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { brl, useApp } from "../App.jsx";

const input = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-400";
const UFS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, setCart, showToast } = useApp();
  const [f, setF] = useState({
    nome: "",
    telefone: "",
    tipo: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    referencia: "",
    pagamento: "",
    cartaoNumero: "",
    cartaoNome: "",
    cartaoValidade: "",
    cartaoCvv: "",
    cpfNota: false,
    cpf: "",
    cupom: "",
    obs: "",
    termos: false,
  });
  const set = (key) => (e) => setF({ ...f, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const taxa = 8;
  const card = f.pagamento === "CARTAO";
  const valid =
    f.nome && f.telefone && f.tipo && f.cep && f.rua && f.numero && f.bairro && f.cidade && f.estado && f.pagamento && f.termos &&
    (!card || (f.cartaoNumero && f.cartaoNome && f.cartaoValidade && f.cartaoCvv));

  const finish = () => {
    if (!window.confirm("Deseja realmente finalizar o pedido?")) return;
    setCart([]);
    showToast("Pedido realizado com sucesso! 🎉");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-orange-50 px-6 py-12">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <h1 className="text-4xl font-extrabold text-gray-900">Finalizar pedido</h1>

          <section className="rounded-3xl bg-white p-8 shadow-2xl shadow-orange-500/10">
            <h2 className="text-xl font-bold text-gray-900">Seus dados</h2>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <input className={input} placeholder="Nome completo *" value={f.nome} onChange={set("nome")} />
              <input className={input} placeholder="Telefone *" value={f.telefone} onChange={set("telefone")} />
            </div>
          </section>

          <section className="rounded-3xl bg-white p-8 shadow-2xl shadow-orange-500/10">
            <h2 className="text-xl font-bold text-gray-900">Entrega</h2>
            <div className="mt-6 flex gap-6 text-sm text-gray-600">
              <label className="flex items-center gap-2">
                <input type="radio" name="tipo" value="DELIVERY" checked={f.tipo === "DELIVERY"} onChange={set("tipo")} /> Entrega
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="tipo" value="PICKUP" checked={f.tipo === "PICKUP"} onChange={set("tipo")} /> Retirada
              </label>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <input className={input} placeholder="CEP *" value={f.cep} onChange={set("cep")} />
              <input className={input} placeholder="Rua *" value={f.rua} onChange={set("rua")} />
              <input className={input} placeholder="Número *" value={f.numero} onChange={set("numero")} />
              <input className={input} placeholder="Complemento" value={f.complemento} onChange={set("complemento")} />
              <input className={input} placeholder="Bairro *" value={f.bairro} onChange={set("bairro")} />
              <input className={input} placeholder="Cidade *" value={f.cidade} onChange={set("cidade")} />
              <select className={input} value={f.estado} onChange={set("estado")}>
                <option value="">Estado *</option>
                {UFS.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
              <input className={input} placeholder="Ponto de referência" value={f.referencia} onChange={set("referencia")} />
            </div>
          </section>

          <section className="rounded-3xl bg-white p-8 shadow-2xl shadow-orange-500/10">
            <h2 className="text-xl font-bold text-gray-900">Pagamento</h2>
            <select className={`${input} mt-6`} value={f.pagamento} onChange={set("pagamento")}>
              <option value="">Forma de pagamento *</option>
              <option value="PIX">Pix</option>
              <option value="CARTAO">Cartão de crédito</option>
              <option value="DINHEIRO">Dinheiro</option>
            </select>
            {card && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <input className={`${input} col-span-2`} placeholder="Número do cartão *" value={f.cartaoNumero} onChange={set("cartaoNumero")} />
                <input className={`${input} col-span-2`} placeholder="Nome impresso no cartão *" value={f.cartaoNome} onChange={set("cartaoNome")} />
                <input className={input} placeholder="Validade *" value={f.cartaoValidade} onChange={set("cartaoValidade")} />
                <input className={input} placeholder="CVV *" value={f.cartaoCvv} onChange={set("cartaoCvv")} />
              </div>
            )}
            <label className="mt-6 flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={f.cpfNota} onChange={set("cpfNota")} /> CPF na nota
            </label>
            {f.cpfNota && <input className={`${input} mt-3`} placeholder="CPF" value={f.cpf} onChange={set("cpf")} />}
            <input className={`${input} mt-4`} placeholder="Cupom de desconto" value={f.cupom} onChange={set("cupom")} />
            <textarea className={`${input} mt-4`} rows={3} placeholder="Observações do pedido" value={f.obs} onChange={set("obs")} />
            <label className="mt-6 flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={f.termos} onChange={set("termos")} /> Li e aceito os termos de uso
            </label>
          </section>
        </div>

        <aside className="h-fit rounded-3xl bg-white p-8 shadow-2xl shadow-orange-500/10">
          <h2 className="text-xl font-bold text-gray-900">Resumo</h2>
          <ul className="mt-6 space-y-3 text-sm text-gray-600">
            {cart.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>
                  {item.qty}x {item.name}
                </span>
                <span>{brl(item.price * item.qty)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 flex justify-between text-sm text-gray-400">
            <span>Taxa de entrega</span> <span>{brl(taxa)}</span>
          </p>
          <p className="mt-2 flex justify-between text-xl font-extrabold text-gray-900">
            <span>Total</span> <span>{brl(subtotal + taxa)}</span>
          </p>
          <button
            disabled={!valid}
            onClick={finish}
            className="mt-8 w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-600 py-4 font-bold text-white shadow-lg shadow-orange-500/40 disabled:opacity-40"
          >
            Finalizar pedido
          </button>
        </aside>
      </div>
    </div>
  );
}
