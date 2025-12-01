import React, { useState } from 'react';
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

export function ExpenseTable({ expenses, onDelete }: ExpenseTableProps) {
    const [deleteId, setDeleteId] = useState<string | number | null>(null);

    const handleDeleteClick = (id: string | number) => {
        setDeleteId(id);
    };

    const confirmDelete = () => {
        if (deleteId) {
            onDelete(deleteId);
            setDeleteId(null);
        }
    };

    return (
        <>
            <div className="w-full max-w-4xl overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                        <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400">
                            <tr>
                                <th scope="col" className="px-6 py-3 w-12"></th>
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
                                    <tr key={expense.id || index} className="bg-white dark:bg-zinc-950 border-b dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                                        <td className="px-6 py-4 text-2xl">{expense.emoji || '💸'}</td>
                                        <td className="px-6 py-4">{expense.date}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <span className="px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs">
                                                    {expense.category}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full text-xs ${expense.type === 'Need'
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                                    }`}>
                                                    {expense.type}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white whitespace-normal break-words max-w-xs">{expense.item_name}</td>
                                        <td className="px-6 py-4 text-right">${expense.amount?.toFixed(2) ?? '0.00'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => expense.id && handleDeleteClick(expense.id)}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                                title="Delete Expense"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M3 6h18"></path>
                                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {deleteId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl max-w-sm w-full overflow-hidden p-6 space-y-6"
                        >
                            <div className="text-center space-y-2">
                                <div className="mx-auto w-12 h-12 rounded-full bg-red-900/20 flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                                        <path d="M3 6h18"></path>
                                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-zinc-100">Delete Expense?</h3>
                                <p className="text-sm text-zinc-400">
                                    Are you sure? This action cannot be undone.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteId(null)}
                                    className="flex-1 py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-lg transition-colors"
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
