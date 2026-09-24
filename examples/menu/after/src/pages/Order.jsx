import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronLeft, Minus, Plus } from "lucide-react";
import { brl, useApp } from "../App.jsx";
import { DELIVERY_FEE, STORE } from "../menu.js";

const input = "mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-orange-500";
const label = "text-sm font-semibold text-gray-900";
const PAYMENTS = [
  ["pix", "Pix"],
  ["cartao", "Cartão"],
  ["dinheiro", "Dinheiro"],
];
const choice = (active) =>
  `cursor-pointer rounded-xl border px-4 py-3 text-center text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-orange-500 ${
    active ? "border-orange-500 bg-orange-50 font-bold text-gray-900" : "border-gray-200 text-gray-600"
  }`;

export default function Order() {
  const navigate = useNavigate();
  const { cart, setQty, customer, setCustomer, placeOrder } = useApp();
  const [f, setF] = useState(() => ({
    delivery: "entrega",
    address: customer.address ?? "",
    complement: customer.complement ?? "",
    name: customer.name ?? "",
    phone: customer.phone ?? "",
    payment: "",
    change: "",
    cpf: "",
    notes: "",
  }));
  const [errors, setErrors] = useState({});
  const set = (key) => (e) => {
    setF({ ...f, [key]: e.target.value });
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const fee = f.delivery === "entrega" ? DELIVERY_FEE : 0;
  const total = subtotal + fee;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-orange-50 px-6 py-16">
        <div className="mx-auto max-w-lg rounded-3xl bg-white p-10 text-center shadow-2xl shadow-orange-500/10">
          <p className="text-5xl">🛍️</p>
          <h1 className="mt-4 text-2xl font-extrabold text-gray-900">Sua sacola está vazia</h1>
          <p className="mt-2 text-gray-600">Escolha um burger, um acompanhamento ou uma bebida no cardápio.</p>
          <Link to="/cardapio" className="mt-8 inline-block rounded-xl bg-gradient-to-r from-orange-700 to-red-600 px-8 py-4 font-bold text-white">
            Ver cardápio
          </Link>
        </div>
      </div>
    );
  }

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (f.delivery === "entrega" && !f.address.trim()) next.address = "Escreva a rua, o número e o bairro.";
    if (!f.name.trim()) next.name = "Diga seu nome para a gente chamar na entrega.";
    if (f.phone.replace(/\D/g, "").length < 10) next.phone = "Informe o WhatsApp com DDD. É por ele que avisamos quando o pedido sair.";
    if (!f.payment) next.payment = "Escolha como vai pagar na entrega.";
    setErrors(next);
    // Bring the first problem into view, so the person sees what is missing.
    requestAnimationFrame(() => document.querySelector("[role=alert]")?.scrollIntoView({ block: "center" }));
    if (Object.keys(next).length) return;
    setCustomer({ name: f.name, phone: f.phone, address: f.address, complement: f.complement });
    const number = placeOrder({ ...f, items: cart, subtotal, fee, total });
    navigate(`/pedido/${number}`);
  };

  const error = (key) =>
    errors[key] && (
      <p role="alert" className="mt-2 text-sm font-medium text-red-700">
        {errors[key]}
      </p>
    );

  return (
    <div className="min-h-screen bg-orange-50 px-6 py-12">
      <form onSubmit={submit} noValidate className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div>
            <Link to="/cardapio" className="inline-flex items-center gap-1 py-1 text-sm font-semibold text-gray-600 hover:text-gray-900">
              <ChevronLeft size={16} /> Adicionar mais itens
            </Link>
            <h1 className="mt-2 text-4xl font-extrabold text-gray-900">Seu pedido</h1>
          </div>

          <section className="rounded-3xl bg-white p-8 shadow-2xl shadow-orange-500/10">
            <h2 className="text-xl font-bold text-gray-900">Como você quer receber?</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className={choice(f.delivery === "entrega")}>
                <input type="radio" name="delivery" value="entrega" className="sr-only" checked={f.delivery === "entrega"} onChange={set("delivery")} />
                Entrega · {brl(DELIVERY_FEE)}
              </label>
              <label className={choice(f.delivery === "retirada")}>
                <input type="radio" name="delivery" value="retirada" className="sr-only" checked={f.delivery === "retirada"} onChange={set("delivery")} />
                Retirar no balcão · grátis
              </label>
            </div>
            {f.delivery === "entrega" ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="address" className={label}>
                    Endereço
                  </label>
                  <input id="address" className={input} placeholder="Rua, número e bairro" autoComplete="street-address" value={f.address} onChange={set("address")} />
                  {error("address")}
                </div>
                <div>
                  <label htmlFor="complement" className={label}>
                    Complemento ou referência (opcional)
                  </label>
                  <input id="complement" className={input} placeholder="Ex.: apto 12, portão azul" value={f.complement} onChange={set("complement")} />
                </div>
              </div>
            ) : (
              <p className="mt-6 text-sm text-gray-600">Retire em {STORE.address}. Fica pronto em cerca de 20 minutos.</p>
            )}
          </section>

          <section className="rounded-3xl bg-white p-8 shadow-2xl shadow-orange-500/10">
            <h2 className="text-xl font-bold text-gray-900">Seus dados</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className={label}>
                  Nome
                </label>
                <input id="name" className={input} autoComplete="given-name" value={f.name} onChange={set("name")} />
                {error("name")}
              </div>
              <div>
                <label htmlFor="phone" className={label}>
                  WhatsApp
                </label>
                <input id="phone" type="tel" inputMode="tel" autoComplete="tel" className={input} placeholder="(11) 99999-9999" value={f.phone} onChange={set("phone")} />
                {error("phone")}
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-600">Seus dados ficam salvos neste aparelho para o próximo pedido.</p>
          </section>

          <section className="rounded-3xl bg-white p-8 shadow-2xl shadow-orange-500/10">
            <h2 className="text-xl font-bold text-gray-900">Pagamento na entrega</h2>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {PAYMENTS.map(([value, name]) => (
                <label key={value} className={choice(f.payment === value)}>
                  <input type="radio" name="payment" value={value} className="sr-only" checked={f.payment === value} onChange={set("payment")} />
                  {name}
                </label>
              ))}
            </div>
            {error("payment")}
            {f.payment === "dinheiro" && (
              <div className="mt-4 sm:w-64">
                <label htmlFor="change" className={label}>
                  Troco para quanto? (opcional)
                </label>
                <input id="change" inputMode="decimal" className={input} placeholder="Ex.: 100" value={f.change} onChange={set("change")} />
              </div>
            )}
            <details className="mt-6">
              <summary className="cursor-pointer py-1 text-sm font-semibold text-orange-700">CPF na nota e observação</summary>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="cpf" className={label}>
                    CPF na nota
                  </label>
                  <input id="cpf" inputMode="numeric" className={input} value={f.cpf} onChange={set("cpf")} />
                </div>
                <div>
                  <label htmlFor="notes" className={label}>
                    Observação do pedido
                  </label>
                  <input id="notes" className={input} placeholder="Ex.: sem talheres" value={f.notes} onChange={set("notes")} />
                </div>
              </div>
            </details>
          </section>
        </div>

        <aside className="h-fit rounded-3xl bg-white p-8 shadow-2xl shadow-orange-500/10 lg:sticky lg:top-8">
          <h2 className="text-xl font-bold text-gray-900">Resumo</h2>
          <ul className="mt-6 space-y-4 text-sm">
            {cart.map((item) => (
              <li key={item.key}>
                <div className="flex justify-between gap-3 text-gray-900">
                  <span className="font-semibold">{item.name}</span>
                  <span>{brl(item.price * item.qty)}</span>
                </div>
                {item.summary && <p className="text-xs text-gray-600">{item.summary}</p>}
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQty(item.key, item.qty - 1)}
                    aria-label={item.qty === 1 ? `Tirar ${item.name} do pedido` : `Um ${item.name} a menos`}
                    className="rounded-full border border-orange-200 p-1.5 text-orange-700"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center font-bold text-gray-900">{item.qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(item.key, item.qty + 1)}
                    aria-label={`Mais um ${item.name}`}
                    className="rounded-full border border-orange-200 p-1.5 text-orange-700"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-6 flex justify-between text-sm text-gray-600">
            <span>{f.delivery === "entrega" ? "Taxa de entrega" : "Retirada no balcão"}</span> <span>{brl(fee)}</span>
          </p>
          <p className="mt-2 flex justify-between text-xl font-extrabold text-gray-900">
            <span>Total</span> <span>{brl(total)}</span>
          </p>
          <button className="mt-8 w-full rounded-xl bg-gradient-to-r from-orange-700 to-red-600 py-4 font-bold text-white shadow-lg shadow-orange-500/40">
            Enviar pedido · {brl(total)}
          </button>
          <p className="mt-3 text-center text-sm text-gray-600">Você recebe a confirmação no WhatsApp.</p>
        </aside>
      </form>
    </div>
  );
}
