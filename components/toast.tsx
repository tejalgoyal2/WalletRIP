'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextValue {
    toast: (opts: { message: string; type?: ToastType }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback(({ message, type = 'info' }: { message: string; type?: ToastType }) => {
        const id = Math.random().toString(36).slice(2);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div
                className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
                aria-live="polite"
                aria-label="Notifications"
            >
                <AnimatePresence>
                    {toasts.map(t => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, x: 60 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 60 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            className={`pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white max-w-xs ${
                                t.type === 'success' ? 'bg-emerald-600' :
                                t.type === 'error'   ? 'bg-red-600' :
                                                       'bg-zinc-800'
                            }`}
                        >
                            <span className="shrink-0 text-base leading-none">
                                {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
                            </span>
                            {t.message}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
