import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, Zap, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Overlay */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          let bg = 'bg-white dark:bg-dark-850 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-lg';
          let icon = <Info className="w-4 h-4 text-primary" />;

          if (toast.type === 'success') {
            bg = 'bg-white dark:bg-dark-850 border-emerald-500/30 text-slate-900 dark:text-slate-100 shadow-emerald-500/10 shadow-lg';
            icon = <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
          } else if (toast.type === 'error') {
            bg = 'bg-white dark:bg-dark-850 border-rose-500/30 text-slate-900 dark:text-slate-100 shadow-rose-500/10 shadow-lg';
            icon = <AlertTriangle className="w-4 h-4 text-rose-500" />;
          } else if (toast.type === 'warning') {
            bg = 'bg-white dark:bg-dark-850 border-amber-500/30 text-slate-900 dark:text-slate-100 shadow-amber-500/10 shadow-lg';
            icon = <AlertTriangle className="w-4 h-4 text-amber-500" />;
          } else if (toast.type === 'cyan') {
            bg = 'bg-white dark:bg-dark-850 border-blue-500/30 text-slate-900 dark:text-slate-100 shadow-blue-500/10 shadow-lg';
            icon = <Zap className="w-4 h-4 text-primary" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 text-sm animate-bounce-in ${bg}`}
            >
              <div className="flex items-center gap-2.5">
                <span className="flex-shrink-0">{icon}</span>
                <span className="font-medium text-xs sm:text-sm">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-3 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors text-xs font-bold p-1 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
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
