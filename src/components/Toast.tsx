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
              "flex items-center gap-3 px-4 py-3 bg-white rounded-2xl shadow-2xl border",
              "border-slate-50 animate-in slide-in-from-right duration-300 min-w-[280px]",
            )}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                t.type === "success"
                  ? "bg-green-50 text-green-500"
                  : t.type === "error"
                    ? "bg-red-50 text-red-500"
                    : "bg-blue-50 text-blue-500"
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
            <p className="text-[12px] font-medium text-[#2D2926] flex-1">{t.message}</p>
            <button
              aria-label="Tutup notifikasi"
              onClick={() => removeToast(t.id)}
              className="text-slate-500 hover:text-slate-700"
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
