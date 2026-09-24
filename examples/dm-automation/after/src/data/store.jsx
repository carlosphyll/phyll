import { createContext, useContext, useState } from "react";

const FlowsContext = createContext(null);

export function FlowsProvider({ children }) {
  const [flows, setFlows] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [instagram, setInstagram] = useState(null);
  const [toast, setToast] = useState(null);

  const hideToast = () => setToast(null);
  const showToast = (message, action) => {
    setToast({ message, action });
    setTimeout(hideToast, 5000);
  };

  // New automations start active with no delay; the only thing people must choose is the keyword and the DM.
  const saveFlow = (flow) => {
    if (flow.id) {
      setFlows((prev) => prev.map((f) => (f.id === flow.id ? { ...f, ...flow } : f)));
      return flow.id;
    }
    const id = Date.now();
    setFlows((prev) => [...prev, { ...flow, id, messages: 0, created: new Date().toLocaleDateString("en-US") }]);
    return id;
  };

  const deleteFlow = (flow) => {
    setFlows((prev) => prev.filter((f) => f.id !== flow.id));
    showToast(`Deleted "${flow.name}".`, { label: "Undo", onClick: () => setFlows((prev) => [...prev, flow]) });
  };

  // A test DM goes to the account owner, so the person sees exactly what their followers will get.
  const sendTest = (flow) => {
    setFlows((prev) => prev.map((f) => (f.id === flow.id ? { ...f, messages: f.messages + 1 } : f)));
    setContacts((prev) => [
      { id: Date.now(), name: "You (test DM)", keyword: flow.keyword, at: new Date().toLocaleTimeString("en-US") },
      ...prev.filter((c) => c.name !== "You (test DM)"),
    ]);
  };

  const connectInstagram = () => setInstagram({ handle: "replyloop.demo" });

  return (
    <FlowsContext.Provider
      value={{ flows, saveFlow, deleteFlow, sendTest, contacts, instagram, connectInstagram, toast, showToast, hideToast }}
    >
      {children}
    </FlowsContext.Provider>
  );
}

export const useFlows = () => useContext(FlowsContext);
