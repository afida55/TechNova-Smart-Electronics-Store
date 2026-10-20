import { createContext, useContext, useState, useCallback } from "react";
import { Check, Info, AlertTriangle } from "lucide-react";
import { C } from "./tokens";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, tone = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div style={{ position: "fixed", top: 16, right: 16, zIndex: 100, display: "flex", flexDirection: "column", gap: 8 }}>
        {toasts.map((t) => {
          const Icon = t.tone === "success" ? Check : t.tone === "warn" ? AlertTriangle : Info;
          const tone = t.tone === "success" ? C.success : t.tone === "warn" ? C.signal : C.electric;
          return (
            <div key={t.id} className="f-body" style={{
              background: C.ink, color: "#fff", borderRadius: 9, padding: "10px 14px",
              display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, minWidth: 220,
              boxShadow: "0 10px 26px rgba(0,0,0,0.22)", animation: "toastIn 0.18s ease-out",
            }}>
              <Icon size={14} color={tone} />
              {t.message}
            </div>
          );
        })}
      </div>
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
