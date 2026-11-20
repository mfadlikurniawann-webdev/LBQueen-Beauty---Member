"use client";
import React, { useState, useCallback, useMemo, createContext, useContext } from "react";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);
  const contextValue = useMemo(() => ({ toast }), [toast]);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div
        aria-live="polite"
        className={cn(
          "fixed bottom-28 md:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-[200] flex flex-col",
          "gap-3 max-w-sm",
        )}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "glass-strong flex items-center gap-3 px-3.5 py-3 rounded-[22px]",
              "animate-in slide-in-from-right fade-in duration-300 min-w-[280px]",
            )}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                t.type === "success"
                  ? "bg-success-soft text-success"
                  : t.type === "error"
                    ? "bg-danger-soft text-danger"
                    : "bg-blush text-brand-ink"
              }`}
            >
              {t.type === "success" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : t.type === "error" ? (
                <AlertCircle className="w-4 h-4" />
              ) : (
                <Info className="w-4 h-4" />
              )}
            </div>
            <p className="text-[13px] font-medium text-ink flex-1">{t.message}</p>
            <button
              aria-label="Tutup notifikasi"
              onClick={() => removeToast(t.id)}
              className="w-11 h-11 -mr-1.5 rounded-full flex items-center justify-center text-ink-muted hover:text-ink hover:bg-fill/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};
