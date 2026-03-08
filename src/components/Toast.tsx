import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning' | 'danger';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success': return { border: 'border-l-emerald-500', shadow: 'shadow-emerald-500/10', icon: <CheckCircle2 size={20} className="text-emerald-500" />, label: 'SUCCESS' };
      case 'error': case 'danger': return { border: 'border-l-red-500', shadow: 'shadow-red-500/10', icon: <AlertCircle size={20} className="text-red-500" />, label: 'CRITICAL' };
      case 'warning': return { border: 'border-l-amber-500', shadow: 'shadow-amber-500/10', icon: <AlertCircle size={20} className="text-amber-500" />, label: 'WARNING' };
      case 'info': return { border: 'border-l-blue-500', shadow: 'shadow-blue-500/10', icon: <AlertCircle size={20} className="text-blue-500" />, label: 'INFO' };
      default: return { border: 'border-l-slate-500', shadow: 'shadow-slate-500/10', icon: <AlertCircle size={20} className="text-slate-500" />, label: 'SYSTEM' };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const styles = getToastStyles(toast.type);
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 20, transition: { duration: 0.2 } }}
                className={`pointer-events-auto flex items-center gap-4 px-5 py-4 rounded-2xl shadow-2xl border-l-[6px] min-w-[320px] max-w-md bg-white border border-slate-100 ${styles.border} ${styles.shadow}`}
              >
                <div>{styles.icon}</div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{styles.label}</p>
                  <p className="text-sm font-bold text-slate-700 leading-tight">{toast.message}</p>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1.5 hover:bg-slate-50 rounded-xl transition-all text-slate-300 hover:text-slate-500 border border-transparent hover:border-slate-200 bg-transparent active:scale-95"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
