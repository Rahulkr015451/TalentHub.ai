"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast Overlay Container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              key={t.id}
              className={cn(
                "w-full p-4 rounded-xl border shadow-xl flex items-center justify-between gap-3 pointer-events-auto backdrop-blur-md bg-card/90",
                t.type === "success" && "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
                t.type === "error" && "border-red-500/20 bg-red-500/5 text-red-400",
                t.type === "info" && "border-primary/20 bg-primary/5 text-primary"
              )}
            >
              <div className="flex items-center gap-2.5">
                {t.type === "success" && <CheckCircle2 className="size-4.5 shrink-0" />}
                {t.type === "error" && <XCircle className="size-4.5 shrink-0" />}
                {t.type === "info" && <AlertCircle className="size-4.5 shrink-0" />}
                <span className="text-xs font-semibold text-foreground/90">{t.message}</span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors p-0.5 hover:bg-muted rounded-md shrink-0"
              >
                <X className="size-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
