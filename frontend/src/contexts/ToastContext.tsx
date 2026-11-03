
import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";
import Toast from "@/components/Toast";
import type { ToastType } from "@/types/toast.type";
import styles from "./css/ToastContext.module.css";

interface ToastItem {
  id       : number;
  type     : ToastType;
  message  : string;
  duration : number;
}

interface ToastContextValue {
  showToast: (
    type: ToastType,
    message: string,
    duration?: number,
  ) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider = ({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [nextId, setNextId] = useState(0);

  const showToast = useCallback(
    (
      type: ToastType,
      message: string,
      duration = 5000,
    ) => {
      const id = nextId;

      setNextId((current) => current + 1);

      setToasts((current) => [
        ...current,
        { id, type, message, duration },
      ]);
    },
    [nextId],
  );

  const removeToast = (id: number) => {
    setToasts((current) =>
      current.filter((toast) => toast.id !== id),
    );
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className={styles.toastContainer}>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            type={toast.type}
            message={toast.message}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast must be used inside ToastProvider",
    );
  }

  return context;
};
