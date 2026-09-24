import { createContext, useContext, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Booking from "./pages/Booking.jsx";
import Done from "./pages/Done.jsx";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export const services = [
  { id: "corte", name: "Corte Masculino", price: "R$ 45", duration: "40 min" },
  { id: "barba", name: "Barba Premium", price: "R$ 35", duration: "30 min" },
  { id: "combo", name: "Corte + Barba", price: "R$ 70", duration: "1h10" },
];
export const barbers = ["Rafael", "Bruno", "Diego"];
export const ADDRESS = "Rua das Flores, 120, Centro";

export default function App() {
  const [booking, setBooking] = useState(null);

  return (
    <AppContext.Provider value={{ booking, setBooking }}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/agendar" element={<Booking />} />
        <Route path="/agendado" element={<Done />} />
      </Routes>
    </AppContext.Provider>
  );
}
