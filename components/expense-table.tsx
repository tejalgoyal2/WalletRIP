import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Expense {
    id?: string | number;
    item_name: string;
    amount: number;
    category: string;
    type: "Need" | "Want";
    date: string;
    emoji?: string;
}

interface ExpenseTableProps {
    expenses: Expense[];
    onDelete: (id: string | number) => void;
}

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
);

const TypeBadge = ({ type }: { type: 'Need' | 'Want' }) => (
    <span className={`px-2 py-1 rounded-full text-xs ${
        type === 'Need'
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
    }`}>
        {type}
    </span>
);

export function ExpenseTable({ expenses, onDelete }: ExpenseTableProps) {
    const [deleteId, setDeleteId] = useState<string | number | null>(null);

    const confirmDelete = () => {
        if (deleteId) {
            onDelete(deleteId);
            setDeleteId(null);
        }
    };

    const emptyState = (
        <p className="px-6 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            No expenses added yet.
        </p>
    );

    return (
        <>
            {/* ── Mobile cards (< md) ───────────────────────────────── */}
            <div className="block md:hidden w-full rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950">
                {expenses.length === 0 ? emptyState : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {expenses.map((expense, index) => (
                            <motion.div
                                key={expense.id ?? index}
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-3 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                            >
                                <span className="text-2xl shrink-0">{expense.emoji || '💸'}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                                        {expense.item_name}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                        <span className="text-xs text-zinc-500">{expense.date}</span>
                                        <span className="px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs">
                                            {expense.category}
                                        </span>
                                        <TypeBadge type={expense.type} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                                        ${expense.amount?.toFixed(2) ?? '0.00'}
                                    </span>
                                    <button
                                        onClick={() => expense.id && setDeleteId(expense.id)}
                                        aria-label="Delete expense"
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Desktop table (≥ md) ──────────────────────────────── */}
            <div className="hidden md:block w-full max-w-4xl overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                        <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400">
                            <tr>
                                <th scope="col" className="px-6 py-3 w-12" />
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Category</th>
                                <th scope="col" className="px-6 py-3">Description</th>
                                <th scope="col" className="px-6 py-3 text-right">Amount</th>
                                <th scope="col" className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">
                                        No expenses added yet.
                                    </td>
                                </tr>
                            ) : (
                                expenses.map((expense, index) => (
                                    <motion.tr
                                        key={expense.id ?? index}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                        className="bg-white dark:bg-zinc-950 border-b dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                                    >
                                        <td className="px-6 py-4 text-2xl">{expense.emoji || '💸'}</td>
                                        <td className="px-6 py-4">{expense.date}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <span className="px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs">
                                                    {expense.category}
                                                </span>
                                                <TypeBadge type={expense.type} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white whitespace-normal break-words max-w-xs">
                                            {expense.item_name}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            ${expense.amount?.toFixed(2) ?? '0.00'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => expense.id && setDeleteId(expense.id)}
                                                aria-label="Delete expense"
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                <TrashIcon />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Delete confirm modal ──────────────────────────────── */}
            <AnimatePresence>
                {deleteId && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setDeleteId(null)}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-dialog-title"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl max-w-sm w-full overflow-hidden p-6 space-y-6"
                        >
                            <div className="text-center space-y-2">
                                <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500" aria-hidden="true">
                                        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                    </svg>
                                </div>
                                <h3 id="delete-dialog-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                    Delete Expense?
                                </h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Are you sure? This action cannot be undone.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteId(null)}
                                    className="flex-1 py-2 px-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
