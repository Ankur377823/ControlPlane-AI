import React, { createContext, useContext, useState, useCallback } from 'react';

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
          let bg = 'bg-slate-800 border-slate-700 text-slate-100';
          let icon = 'ℹ️';

          if (toast.type === 'success') {
            bg = 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100 shadow-emerald-900/20';
            icon = '✅';
          } else if (toast.type === 'error') {
            bg = 'bg-rose-950/90 border-rose-500/40 text-rose-100 shadow-rose-900/20';
            icon = '⚠️';
          } else if (toast.type === 'warning') {
            bg = 'bg-amber-950/90 border-amber-500/40 text-amber-100 shadow-amber-900/20';
            icon = '⚡';
          } else if (toast.type === 'cyan') {
            bg = 'bg-cyan-950/90 border-cyan-500/40 text-cyan-100 shadow-cyan-900/20';
            icon = '📋';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 text-sm animate-bounce-in ${bg}`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">{icon}</span>
                <span className="font-medium text-xs sm:text-sm">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-3 text-slate-400 hover:text-white transition-colors text-xs font-bold px-1.5 py-0.5 rounded"
              >
                ✕
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
