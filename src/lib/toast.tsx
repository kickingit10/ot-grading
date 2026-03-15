'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error';
interface Toast { id: number; message: string; type: ToastType; }
interface ToastContextType { toast: (message: string, type?: ToastType) => void; }

const ToastContext = createContext<ToastContextType>({ toast: () => {} });
export function useToast() { return useContext(ToastContext); }

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id}
            className="pointer-events-auto px-4 py-2.5 rounded-lg border text-sm font-medium animate-slide-in max-w-xs"
            style={{
              background: t.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              borderColor: t.type === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)',
              color: t.type === 'success' ? 'var(--color-success)' : 'var(--color-error)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
