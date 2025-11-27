import React from 'react';

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
    const handleDelete = (id: string | number) => {
        if (confirm("Delete this expense?")) {
            onDelete(id);
        }
    };

    return (
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
                                    <td className="px-6 py-4 text-right">${expense.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => expense.id && handleDelete(expense.id)}
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
    );
}
