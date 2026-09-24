import { createContext, useContext, useState } from "react";

const FlowsContext = createContext(null);

export function FlowsProvider({ children }) {
  const [flows, setFlows] = useState([]);
  const [toast, setToast] = useState(null);

  const addFlow = (flow) => {
    setFlows((prev) => [
      ...prev,
      { ...flow, id: Date.now(), messages: 0, created: new Date().toLocaleDateString("en-US") },
    ]);
  };

  const deleteFlow = (id) => setFlows((prev) => prev.filter((f) => f.id !== id));

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <FlowsContext.Provider value={{ flows, addFlow, deleteFlow, toast, showToast }}>
      {children}
    </FlowsContext.Provider>
  );
}

export const useFlows = () => useContext(FlowsContext);
