import React from 'react';

export interface Expense {
    id?: string | number;
    item: string;
    amount: number;
    category: string;
    type: "Need" | "Want";
    date: string;
}

interface ExpenseTableProps {
    expenses: Expense[];
}

export function ExpenseTable({ expenses }: ExpenseTableProps) {
    return (
        <div className="w-full max-w-4xl overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Category</th>
                            <th scope="col" className="px-6 py-3">Description</th>
                            <th scope="col" className="px-6 py-3 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400">
                                    No expenses added yet.
                                </td>
                            </tr>
                        ) : (
                            expenses.map((expense, index) => (
                                <tr key={expense.id || index} className="bg-white dark:bg-zinc-950 border-b dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900">
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
                                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">{expense.item}</td>
                                    <td className="px-6 py-4 text-right">${expense.amount.toFixed(2)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
