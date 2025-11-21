import React from 'react';

export function ExpenseTable() {
    // Placeholder data for visualization
    const expenses = [
        { id: 1, date: '2023-10-27', category: 'Food', description: 'Lunch at Joe\'s', amount: 15.00 },
        { id: 2, date: '2023-10-26', category: 'Transport', description: 'Uber to work', amount: 24.50 },
        { id: 3, date: '2023-10-25', category: 'Utilities', description: 'Electric Bill', amount: 120.00 },
    ];

    return (
        <div className="w-full max-w-4xl overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm text-left text-zinc-500 dark:text-zinc-400">
                <thead className="text-xs text-zinc-700 uppercase bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">Date</th>
                        <th scope="col" className="px-6 py-3">Category</th>
                        <th scope="col" className="px-6 py-3">Description</th>
                        <th scope="col" className="px-6 py-3 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {expenses.map((expense) => (
                        <tr key={expense.id} className="bg-white dark:bg-zinc-950 border-b dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                            <td className="px-6 py-4">{expense.date}</td>
                            <td className="px-6 py-4">
                                <span className="px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs">
                                    {expense.category}
                                </span>
                            </td>
                            <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white">{expense.description}</td>
                            <td className="px-6 py-4 text-right">${expense.amount.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
