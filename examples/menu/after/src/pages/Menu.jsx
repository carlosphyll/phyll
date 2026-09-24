import { useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, X } from "lucide-react";
import { brl, useApp } from "../App.jsx";
import { DELIVERY_FEE, PAES, PONTOS, categories, defaultOptions, extras, menu, removable, unitPrice } from "../menu.js";

const chip = (active) =>
  `cursor-pointer rounded-xl border p-3 text-center text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-orange-500 ${
    active ? "border-orange-500 bg-orange-50 font-bold text-gray-900" : "border-gray-200 text-gray-600"
  }`;

function CustomizeModal({ product, onClose }) {
  const { addToCart } = useApp();
  const [o, setO] = useState(defaultOptions);
  const toggle = (key, value) => setO({ ...o, [key]: o[key].includes(value) ? o[key].filter((v) => v !== value) : [...o[key], value] });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="customize-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 id="customize-title" className="text-2xl font-extrabold text-gray-900">
              {product.name}
            </h2>
            <p className="mt-1 text-sm text-gray-600">Já vem ao ponto, no pão brioche. Mude só o que quiser ✨</p>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <fieldset className="mt-6">
          <legend className="text-sm font-bold text-gray-900">Ponto da carne</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {PONTOS.map((p) => (
              <label key={p} className={chip(o.ponto === p)}>
                <input type="radio" name="ponto" className="sr-only" checked={o.ponto === p} onChange={() => setO({ ...o, ponto: p })} />
                {p}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-sm font-bold text-gray-900">Pão</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {PAES.map((p) => (
              <label key={p} className={chip(o.pao === p)}>
                <input type="radio" name="pao" className="sr-only" checked={o.pao === p} onChange={() => setO({ ...o, pao: p })} />
                {p}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-sm font-bold text-gray-900">Adicionais</legend>
          {extras.map((x) => (
            <label key={x.id} className="mt-2 flex items-center justify-between py-1 text-sm text-gray-700">
              <span>
                <input type="checkbox" checked={o.extras.includes(x.id)} onChange={() => toggle("extras", x.id)} /> {x.name}
              </span>
              <span className="text-gray-600">+ {brl(x.price)}</span>
            </label>
          ))}
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-sm font-bold text-gray-900">Tirar algum ingrediente?</legend>
          {removable.map((r) => (
            <label key={r} className="mt-2 flex items-center gap-2 py-1 text-sm text-gray-700">
              <input type="checkbox" checked={o.remove.includes(r)} onChange={() => toggle("remove", r)} /> {r}
            </label>
          ))}
        </fieldset>

        <label htmlFor="obs" className="mt-6 block text-sm font-bold text-gray-900">
          Observação
        </label>
        <textarea
          id="obs"
          rows={2}
          className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          placeholder="Ex.: cortar ao meio"
          value={o.obs}
          onChange={(e) => setO({ ...o, obs: e.target.value })}
        />

        <button
          onClick={() => {
            addToCart(product, o);
            onClose();
          }}
          className="mt-8 w-full rounded-xl bg-gradient-to-r from-orange-700 to-red-600 py-4 font-bold text-white shadow-lg shadow-orange-500/40"
        >
          Adicionar à sacola · {brl(unitPrice(product, o))}
        </button>
      </div>
    </div>
  );
}

function Bag() {
  const { cart, setQty } = useApp();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="rounded-3xl bg-white p-6 shadow-2xl shadow-orange-500/10">
      <h2 className="text-xl font-extrabold text-gray-900">Sua sacola 🛍️</h2>
      {cart.length === 0 ? (
        <p className="mt-3 text-sm text-gray-600">Vazia por enquanto. Toque em Adicionar em qualquer item do cardápio.</p>
      ) : (
        <>
          <ul className="mt-4 space-y-4">
            {cart.map((item) => (
              <li key={item.key}>
                <div className="flex justify-between gap-3">
                  <p className="font-bold text-gray-900">{item.name}</p>
                  <p className="font-bold text-gray-900">{brl(item.price * item.qty)}</p>
                </div>
                {item.summary && <p className="text-xs text-gray-600">{item.summary}</p>}
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => setQty(item.key, item.qty - 1)}
                    aria-label={item.qty === 1 ? `Tirar ${item.name} da sacola` : `Um ${item.name} a menos`}
                    className="rounded-full border border-orange-200 p-1.5 text-orange-700"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-gray-900">{item.qty}</span>
                  <button
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
          <p className="mt-6 flex justify-between border-t border-orange-100 pt-4 text-lg font-extrabold text-gray-900">
            <span>Subtotal</span> <span>{brl(subtotal)}</span>
          </p>
          <Link
            to="/pedido"
            className="mt-4 block rounded-xl bg-gradient-to-r from-orange-700 to-red-600 py-4 text-center font-bold text-white shadow-lg shadow-orange-500/40"
          >
            Fazer pedido
          </Link>
        </>
      )}
    </div>
  );
}

export default function Menu() {
  const { cart, addToCart } = useApp();
  const [customizing, setCustomizing] = useState(null);
  const [added, setAdded] = useState(null);
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const quickAdd = (product) => {
    addToCart(product, product.options ? defaultOptions() : null);
    setAdded(product.id);
    setTimeout(() => setAdded((id) => (id === product.id ? null : id)), 1500);
  };

  return (
    <div className="min-h-screen bg-orange-50 pb-28 lg:pb-0">
      <header className="sticky top-0 z-40 border-b border-orange-100 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-2xl font-extrabold text-transparent">
            Brasa Burger 🔥
          </Link>
          <nav className="hidden gap-2 md:flex">
            {categories.map((c) => (
              <a key={c} href={`#${c.toLowerCase()}`} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition-all duration-300 hover:text-orange-700">
                {c}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_20rem]">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">Cardápio</h1>
          <p className="mt-2 text-gray-600">Entrega em 30 a 45 min · Taxa de entrega {brl(DELIVERY_FEE)} · Pagamento na entrega</p>

          {categories.map((c) => (
            <section key={c} id={c.toLowerCase()} className="scroll-mt-24">
              <h2 className="mt-10 text-2xl font-extrabold text-gray-900">{c}</h2>
              <div className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {menu
                  .filter((p) => p.category === c)
                  .map((p) => (
                    <div key={p.id} className="rounded-3xl bg-white p-6 shadow-2xl shadow-orange-500/10 transition-all duration-300 hover:scale-105">
                      <div className="flex h-32 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 text-6xl">{p.emoji}</div>
                      <h3 className="mt-5 text-xl font-bold text-gray-900">{p.name}</h3>
                      <p className="mt-2 text-sm text-gray-600">{p.desc}</p>
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-2xl font-extrabold text-orange-700">{brl(p.price)}</span>
                        <button
                          onClick={() => quickAdd(p)}
                          className="whitespace-nowrap rounded-xl bg-gradient-to-r from-orange-700 to-red-600 px-5 py-2.5 font-bold text-white"
                          aria-live="polite"
                        >
                          {added === p.id ? "Na sacola ✓" : "Adicionar"}
                        </button>
                      </div>
                      {p.options && (
                        <button onClick={() => setCustomizing(p)} className="mt-3 py-1 text-sm font-semibold text-orange-700 underline-offset-4 hover:underline">
                          Ao ponto, no brioche · Personalizar
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <Bag />
          </div>
        </aside>
      </main>

      {count > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-orange-100 bg-white/90 p-4 backdrop-blur-xl lg:hidden">
          <Link
            to="/pedido"
            className="block rounded-xl bg-gradient-to-r from-orange-700 to-red-600 py-4 text-center font-bold text-white shadow-lg shadow-orange-500/40"
          >
            Fazer pedido · {count} {count === 1 ? "item" : "itens"} · {brl(subtotal)}
          </Link>
        </div>
      )}

      {customizing && <CustomizeModal product={customizing} onClose={() => setCustomizing(null)} />}
    </div>
  );
}
