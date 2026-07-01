import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { FiAlertCircle, FiCheckCircle, FiX } from "react-icons/fi";
import { cx } from "../utils/format";

type ToastType = "success" | "error" | "warning";
type Toast = { id: number; type: ToastType; message: string };
type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};
const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = Date.now();
      setToasts((current) => [...current, { id, message, type }]);
      window.setTimeout(
        () =>
          setToasts((current) => current.filter((toast) => toast.id !== id)),
        3600,
      );
    },
    [],
  );
  const value = useMemo(() => ({ showToast }), [showToast]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cx(
              "flex items-start gap-3 rounded-xl border bg-white p-4 shadow-soft",
              toast.type === "success" && "border-success/20",
              toast.type === "error" && "border-danger/20",
              toast.type === "warning" && "border-warning/20",
            )}
          >
            {toast.type === "success" ? (
              <FiCheckCircle className="mt-0.5 text-success" />
            ) : (
              <FiAlertCircle
                className={cx(
                  "mt-0.5",
                  toast.type === "error" ? "text-danger" : "text-warning",
                )}
              />
            )}
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              onClick={() =>
                setToasts((current) =>
                  current.filter((item) => item.id !== toast.id),
                )
              }
              className="text-slate-400 hover:text-slate-700"
              aria-label="Dismiss"
            >
              <FiX />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
