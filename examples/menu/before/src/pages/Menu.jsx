import { useState } from "react";
import { Navigate } from "react-router-dom";
import { ShoppingBag, X } from "lucide-react";
import { CartDrawer, brl, useApp } from "../App.jsx";
import { categories, extras, menu, removable } from "../menu.js";

function CustomizeModal({ product, onClose }) {
  const { cart, setCart, showToast } = useApp();
  const [o, setO] = useState({ ponto: "", pao: "", adicionais: [], remover: [], obs: "", qty: 1 });
  const toggle = (key, value) => setO({ ...o, [key]: o[key].includes(value) ? o[key].filter((v) => v !== value) : [...o[key], value] });
  const extra = o.adicionais.reduce((sum, id) => sum + extras.find((x) => x.id === id).price, 0);
  const valid = o.ponto && o.pao;

  const add = () => {
    setCart([...cart, { id: Date.now(), name: product.name, price: product.price + extra, qty: Number(o.qty), options: o }]);
    showToast("Produto adicionado ao carrinho! 🎉");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">{product.name}</h2>
            <p className="mt-1 text-sm text-gray-400">Personalize do seu jeito ✨</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <p className="mt-6 text-sm font-bold text-gray-900">Ponto da carne *</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {[
            ["MAL_PASSADO", "Mal passado"],
            ["AO_PONTO", "Ao ponto"],
            ["BEM_PASSADO", "Bem passado"],
          ].map(([value, label]) => (
            <label
              key={value}
              className={`cursor-pointer rounded-xl border p-3 text-center text-sm ${o.ponto === value ? "border-orange-500 bg-orange-50 font-bold" : "border-gray-200 text-gray-600"}`}
            >
              <input type="radio" name="ponto" className="hidden" checked={o.ponto === value} onChange={() => setO({ ...o, ponto: value })} />
              {label}
            </label>
          ))}
        </div>

        <p className="mt-6 text-sm font-bold text-gray-900">Tipo de pão *</p>
        <select className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none" value={o.pao} onChange={(e) => setO({ ...o, pao: e.target.value })}>
          <option value="">Selecione</option>
          <option>Brioche</option>
          <option>Australiano</option>
          <option>Integral</option>
        </select>

        <p className="mt-6 text-sm font-bold text-gray-900">Adicionais</p>
        {extras.map((x) => (
          <label key={x.id} className="mt-2 flex items-center justify-between text-sm text-gray-600">
            <span>
              <input type="checkbox" checked={o.adicionais.includes(x.id)} onChange={() => toggle("adicionais", x.id)} /> {x.name}
            </span>
            <span className="text-gray-400">+ {brl(x.price)}</span>
          </label>
        ))}

        <p className="mt-6 text-sm font-bold text-gray-900">Remover ingredientes</p>
        {removable.map((r) => (
          <label key={r} className="mt-2 flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={o.remover.includes(r)} onChange={() => toggle("remover", r)} /> {r}
          </label>
        ))}

        <p className="mt-6 text-sm font-bold text-gray-900">Observações</p>
        <textarea
          className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none"
          rows={3}
          placeholder="Alguma observação?"
          value={o.obs}
          onChange={(e) => setO({ ...o, obs: e.target.value })}
        />

        <p className="mt-6 text-sm font-bold text-gray-900">Quantidade</p>
        <input
          type="number"
          min={1}
          className="mt-2 w-24 rounded-xl border border-gray-200 px-4 py-3 outline-none"
          value={o.qty}
          onChange={(e) => setO({ ...o, qty: e.target.value })}
        />

        <button
          disabled={!valid}
          onClick={add}
          className="mt-8 w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-600 py-4 font-bold text-white shadow-lg shadow-orange-500/40 disabled:opacity-40"
        >
          Adicionar ao carrinho · {brl((product.price + extra) * (Number(o.qty) || 1))}
        </button>
      </div>
    </div>
  );
}

export default function Menu() {
  const { user, cart } = useApp();
  const [category, setCategory] = useState("Burgers");
  const [selected, setSelected] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  if (!user) return <Navigate to="/entrar" replace />;
  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="min-h-screen bg-orange-50">
      <header className="sticky top-0 z-40 border-b border-orange-100 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-2xl font-extrabold text-transparent">Brasa Burger 🔥</span>
          <button onClick={() => setCartOpen(true)} className="relative rounded-full bg-gradient-to-r from-orange-500 to-red-600 p-3 text-white shadow-lg shadow-orange-500/40">
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 animate-bounce items-center justify-center rounded-full bg-gray-900 text-xs font-bold">{count}</span>
            )}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-4xl font-extrabold text-gray-900">Olá, {user.nome}! 👋</h1>
        <p className="mt-2 text-gray-400">O que vamos pedir hoje?</p>

        <div className="mt-8 flex gap-3">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                category === c ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30" : "bg-white text-gray-500"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-3 gap-8">
          {menu
            .filter((p) => p.category === category)
            .map((p) => (
              <div key={p.id} className="rounded-3xl bg-white p-6 shadow-2xl shadow-orange-500/10 transition-all duration-300 hover:scale-105">
                <div className="flex h-40 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-red-100 text-7xl">{p.emoji}</div>
                <h3 className="mt-5 text-xl font-bold text-gray-900">{p.name}</h3>
                <p className="mt-2 text-sm text-gray-400">{p.desc}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-2xl font-extrabold text-orange-600">{brl(p.price)}</span>
                  <button onClick={() => setSelected(p)} className="rounded-xl bg-gradient-to-r from-orange-500 to-red-600 px-5 py-2.5 font-bold text-white">
                    Adicionar
                  </button>
                </div>
              </div>
            ))}
        </div>
      </main>

      {selected && <CustomizeModal product={selected} onClose={() => setSelected(null)} />}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
