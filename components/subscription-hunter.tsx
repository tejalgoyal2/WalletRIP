import React, { useState } from 'react';
import { Expense } from './expense-table';
import { motion, AnimatePresence } from 'framer-motion';

interface SubscriptionHunterProps {
    expenses: Expense[];
}

interface SubscriptionData {
    subscriptions: { name: string; amount: number; frequency: string }[];
    total_monthly_cost: number;
    advice: string;
}

export function SubscriptionHunter({ expenses }: SubscriptionHunterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<SubscriptionData | null>(null);

    const handleAnalyze = async () => {
        setIsOpen(true);
        if (data) return; // Don't re-fetch if we already have data

        setIsLoading(true);
        try {
            const response = await fetch('/api/analyze-subs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ expenses }),
            });

            if (!response.ok) throw new Error('Failed to analyze');

            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={handleAnalyze}
                disabled={!expenses.length}
                className="px-3 py-1 text-xs font-medium text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 border border-zinc-200 dark:border-zinc-800 rounded-full hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Find Subs 🕵️
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
                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                        Subscription Detective 🕵️‍♂️
                                    </h3>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-8 gap-3 text-zinc-500">
                                        <span className="animate-spin text-3xl">🔍</span>
                                        <p className="text-sm">Scanning your financial history...</p>
                                    </div>
                                ) : data ? (
                                    <div className="space-y-6">
                                        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4 max-h-[200px] overflow-y-auto space-y-3">
                                            {data.subscriptions.length > 0 ? (
                                                data.subscriptions.map((sub, i) => (
                                                    <div key={i} className="flex items-center justify-between text-sm">
                                                        <span className="font-medium text-zinc-700 dark:text-zinc-300">{sub.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-zinc-500 text-xs">{sub.frequency}</span>
                                                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                                                ${sub.amount.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-center text-zinc-500 text-sm py-2">No subscriptions found!</p>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-4">
                                            <span className="text-sm font-medium text-zinc-500">Total Monthly Cost</span>
                                            <span className="text-xl font-bold text-red-500 dark:text-red-400">
                                                ${data.total_monthly_cost.toFixed(2)}
                                            </span>
                                        </div>

                                        {data.advice && (
                                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                                                <p className="text-sm text-indigo-700 dark:text-indigo-300 italic">
                                                    " {data.advice} "
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center text-red-500 py-4">
                                        Failed to load data.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
