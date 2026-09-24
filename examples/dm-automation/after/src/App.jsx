import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import AppLayout from "./components/AppLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Flows from "./pages/Flows.jsx";
import Contacts from "./pages/Contacts.jsx";
import Settings from "./pages/Settings.jsx";
import { FlowsProvider } from "./data/store.jsx";

export default function App() {
  return (
    <FlowsProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/flows" element={<Flows />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </FlowsProvider>
  );
}
