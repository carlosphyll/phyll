import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { brl, useApp } from "../App.jsx";
import { STORE } from "../menu.js";

const PAYMENT = { pix: "Pix", cartao: "cartão", dinheiro: "dinheiro" };
const secondary = "rounded-xl border border-orange-200 bg-white px-6 py-3 font-semibold text-gray-700";

function whatsappUrl(order) {
  const lines = order.items.map((item) => `${item.qty}x ${item.name}${item.summary ? ` (${item.summary})` : ""}`);
  const text = [`Olá! Sou ${order.name}, pedido nº ${order.number}:`, ...lines, `Total: ${brl(order.total)}`].join("\n");
  return `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(text)}`;
}

export default function Confirmed() {
  const { numero } = useParams();
  const navigate = useNavigate();
  const { orders, orderAgain } = useApp();
  const order = orders.find((o) => o.number === numero);
  if (!order) return <Navigate to="/cardapio" replace />;

  const delivery = order.delivery === "entrega";
  const change = order.payment === "dinheiro" && order.change ? `, troco para R$ ${order.change}` : "";

  return (
    <div className="min-h-screen bg-orange-50 px-6 py-12">
      <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-2xl shadow-orange-500/10 md:p-10">
        <p className="text-sm font-bold text-orange-700">Pedido nº {order.number} recebido 🔥</p>
        <h1 className="mt-2 text-3xl font-extrabold text-gray-900">{delivery ? "Chega em 30 a 45 minutos" : "Fica pronto em cerca de 20 minutos"}</h1>
        <p className="mt-2 text-gray-600">
          {delivery ? `Em ${order.address}${order.complement ? `, ${order.complement}` : ""}.` : `Retire em ${STORE.address}.`}
        </p>

        <ul className="mt-6 space-y-2 border-t border-orange-100 pt-6 text-gray-900">
          {order.items.map((item) => (
            <li key={item.key} className="flex justify-between gap-3">
              <span>
                {item.qty}x {item.name}
                {item.summary && <span className="block text-xs text-gray-600">{item.summary}</span>}
              </span>
              <span>{brl(item.price * item.qty)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between border-t border-orange-100 pt-4 text-lg font-extrabold text-gray-900">
          <span>Total</span> <span>{brl(order.total)}</span>
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Pagamento na {delivery ? "entrega" : "retirada"}, com {PAYMENT[order.payment]}
          {change}.
        </p>

        <p className="mt-6 text-gray-700">
          {order.name.split(" ")[0]}, vamos avisar no WhatsApp {order.phone} quando o pedido sair.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={whatsappUrl(order)}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-gradient-to-r from-orange-700 to-red-600 px-6 py-3 font-bold text-white shadow-lg shadow-orange-500/40"
          >
            Falar com a loja no WhatsApp
          </a>
          <button
            onClick={() => {
              orderAgain(order);
              navigate("/pedido");
            }}
            className={secondary}
          >
            Pedir de novo
          </button>
          <Link to="/cardapio" className={secondary}>
            Voltar ao cardápio
          </Link>
        </div>
      </div>
    </div>
  );
}
