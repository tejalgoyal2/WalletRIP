import { useState } from 'react';
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
    const [error, setError] = useState<string | null>(null);

    const handleClose = () => {
        setIsOpen(false);
        setData(null);
        setError(null);
    };

    const handleAnalyze = async () => {
        setIsOpen(true);
        setIsLoading(true);
        setError(null);
        setData(null);

        try {
            const response = await fetch('/api/analyze-subs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ expenses }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to analyze');
            }

            const result = await response.json();
            setData(result);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to analyze subscriptions';
            console.error('[SubscriptionHunter]', message);
            setError(message);
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
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={handleClose}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="subs-dialog-title"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-zinc-200 dark:border-zinc-800"
                        >
                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 id="subs-dialog-title" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                        Subscription Detective 🕵️‍♂️
                                    </h3>
                                    <button
                                        onClick={handleClose}
                                        aria-label="Close"
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
                                ) : error ? (
                                    <div className="flex flex-col items-center gap-4 py-6 text-center">
                                        <p className="text-sm text-red-500">{error}</p>
                                        <button
                                            onClick={handleAnalyze}
                                            className="px-4 py-2 text-sm font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md hover:opacity-90 transition-opacity"
                                        >
                                            Retry
                                        </button>
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
                                                    "{data.advice}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
