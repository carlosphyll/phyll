import { createContext, useContext, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Signup from "./pages/Signup.jsx";
import Booking from "./pages/Booking.jsx";
import Account from "./pages/Account.jsx";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export default function App() {
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <AppContext.Provider value={{ user, setUser, showToast }}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/cadastro" element={<Signup />} />
        <Route path="/agendar" element={<Booking />} />
        <Route path="/minha-conta" element={<Account />} />
      </Routes>
      {toast && (
        <div className="fixed bottom-6 right-6 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3 font-bold text-zinc-950 shadow-lg shadow-amber-500/40 animate-bounce">
          {toast}
        </div>
      )}
    </AppContext.Provider>
  );
}
