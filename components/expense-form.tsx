import React from 'react';

export function ExpenseForm() {
    return (
        <div className="w-full max-w-md p-4 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Add Expense</h2>
            <form className="space-y-4">
                <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Notes
                    </label>
                    <textarea
                        id="notes"
                        rows={4}
                        className="w-full p-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="e.g. Spent $15 on lunch at Joe's"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium rounded-md hover:opacity-90 transition-opacity"
                >
                    Add Expense
                </button>
            </form>
        </div>
    );
}
