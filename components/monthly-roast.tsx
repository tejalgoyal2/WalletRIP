import React, { useState } from 'react';
import { Expense } from './expense-table';
import { motion, AnimatePresence } from 'framer-motion';

interface MonthlyRoastProps {
    expenses: Expense[];
}

export function MonthlyRoast({ expenses }: MonthlyRoastProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [roast, setRoast] = useState<string | null>(null);

    const handleRoast = async () => {
        setIsOpen(true);
        setIsLoading(true);
        setRoast(null);

        try {
            const response = await fetch('/api/roast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ expenses }),
            });

            if (!response.ok) throw new Error('Failed to get roasted');

            const data = await response.json();
            setRoast(data.roast);
        } catch (error) {
            console.error(error);
            setRoast("The AI is too stunned by your spending to speak. Try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={handleRoast}
                className="px-3 py-1 text-xs font-medium text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 border border-zinc-200 dark:border-zinc-800 rounded-full hover:border-red-200 dark:hover:border-red-900 transition-colors"
            >
                Get Roasted 🌶️
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-zinc-200 dark:border-zinc-800"
                        >
                            <div className="p-6 text-center space-y-4">
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                    Performance Review 📋
                                </h3>

                                <div className="min-h-[100px] flex items-center justify-center">
                                    {isLoading ? (
                                        <div className="flex flex-col items-center gap-2 text-zinc-500">
                                            <span className="animate-spin text-2xl">🤔</span>
                                            <p className="text-sm">Analyzing bad decisions...</p>
                                        </div>
                                    ) : (
                                        <p className="text-lg font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed">
                                            {roast?.split(/(\*[^*]+\*)/g).map((part, index) => {
                                                if (part.startsWith('*') && part.endsWith('*')) {
                                                    return (
                                                        <span key={index} className="font-bold">
                                                            {part.slice(1, -1)}
                                                        </span>
                                                    );
                                                }
                                                return part;
                                            })}
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-full py-2 px-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    Okay, I'll do better 😭
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
