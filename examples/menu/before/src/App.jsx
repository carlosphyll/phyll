import { createContext, useContext, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Menu from "./pages/Menu.jsx";
import Checkout from "./pages/Checkout.jsx";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);
export const brl = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function CartDrawer({ open, onClose }) {
  const { cart } = useApp();
  const navigate = useNavigate();
  if (!open) return null;
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="h-full w-96 bg-white p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-gray-900">Seu carrinho 🛒</h2>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        {cart.length === 0 ? (
          <p className="mt-10 text-center text-gray-400">Carrinho vazio</p>
        ) : (
          <ul className="mt-8 space-y-4">
            {cart.map((item) => (
              <li key={item.id} className="rounded-2xl bg-orange-50 p-4">
                <p className="font-bold text-gray-900">
                  {item.qty}x {item.name}
                </p>
                <p className="text-xs text-gray-400">
                  Ponto: {item.options.ponto} · Pão: {item.options.pao}
                </p>
                <p className="mt-1 font-bold text-orange-600">{brl(item.price * item.qty)}</p>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-8 flex justify-between text-lg font-extrabold text-gray-900">
          <span>Total</span> <span>{brl(total)}</span>
        </p>
        <button
          disabled={!cart.length}
          onClick={() => {
            onClose();
            navigate("/checkout");
          }}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-orange-500 to-red-600 py-4 font-bold text-white shadow-lg shadow-orange-500/40 disabled:opacity-40"
        >
          Finalizar compra
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <AppContext.Provider value={{ user, setUser, cart, setCart, showToast }}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/entrar" element={<Login />} />
        <Route path="/cardapio" element={<Menu />} />
        <Route path="/checkout" element={<Checkout />} />
      </Routes>
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-bounce rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 px-6 py-3 font-bold text-white shadow-2xl shadow-orange-500/40">
          {toast}
        </div>
      )}
    </AppContext.Provider>
  );
}
