import { createContext, useContext, useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Menu from "./pages/Menu.jsx";
import Order from "./pages/Order.jsx";
import Confirmed from "./pages/Confirmed.jsx";
import { optionSummary, unitPrice } from "./menu.js";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);
export const brl = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// The bag, the customer's details and past orders stay on this device. No account needed.
function useStored(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Private windows can refuse storage. Ordering still works; it forgets on reload.
    }
  }, [key, value]);
  return [value, setValue];
}

export default function App() {
  const [cart, setCart] = useStored("brasa.cart", []);
  const [customer, setCustomer] = useStored("brasa.customer", {});
  const [orders, setOrders] = useStored("brasa.orders", []);

  // The same item with the same options adds up instead of repeating.
  const addToCart = (product, options) => {
    const key = `${product.id}:${JSON.stringify(options ?? null)}`;
    setCart((list) =>
      list.some((item) => item.key === key)
        ? list.map((item) => (item.key === key ? { ...item, qty: item.qty + 1 } : item))
        : [...list, { key, name: product.name, price: unitPrice(product, options), qty: 1, summary: optionSummary(options) }],
    );
  };
  const setQty = (key, qty) =>
    setCart((list) => (qty <= 0 ? list.filter((item) => item.key !== key) : list.map((item) => (item.key === key ? { ...item, qty } : item))));
  const placeOrder = (order) => {
    const number = String(1042 + orders.length);
    setOrders((list) => [{ ...order, number, createdAt: new Date().toISOString() }, ...list]);
    setCart([]);
    return number;
  };
  const orderAgain = (order) => setCart(order.items.map((item) => ({ ...item })));

  return (
    <AppContext.Provider value={{ cart, addToCart, setQty, customer, setCustomer, orders, placeOrder, orderAgain }}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/cardapio" element={<Menu />} />
        <Route path="/pedido" element={<Order />} />
        <Route path="/pedido/:numero" element={<Confirmed />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppContext.Provider>
  );
}
