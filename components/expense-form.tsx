import React, { useState } from 'react';
import { Expense } from './expense-table';
import { createClient } from '@/utils/supabase/client';

interface ExpenseFormProps {
    onExpenseAdded: (expenses: Expense[]) => void;
}

export function ExpenseForm({ onExpenseAdded }: ExpenseFormProps) {
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [funnyComment, setFunnyComment] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!notes.trim()) return;

        setIsLoading(true);
        setFunnyComment(null); // Reset previous comment

        try {
            // 1. Parse with Gemini
            const response = await fetch('/api/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: notes,
            });

            if (!response.ok) {
                throw new Error('Failed to parse expenses');
            }

            const parsedExpenses: any[] = await response.json();

            // Extract funny comment
            const comment = parsedExpenses[0]?.funny_comment;
            if (comment) {
                setFunnyComment(comment);
                setTimeout(() => setFunnyComment(null), 8000);
            }

            // Check if it's a valid expense
            if (!parsedExpenses[0]?.is_expense) {
                setIsLoading(false);
                setNotes('');
                return;
            }

            // 2. Save to Supabase
            const supabase = createClient();

            // Map to DB schema
            const dbExpenses = parsedExpenses.map(exp => ({
                item_name: exp.item_name, // Now matching API response
                amount: exp.amount,
                category: exp.category,
                type: exp.type,
                date: exp.date
            }));

            const { data, error } = await supabase
                .from('expenses')
                .insert(dbExpenses)
                .select();

            if (error) {
                console.error('Supabase Insert Error:', error);
                throw new Error('Database Error: ' + error.message);
            }

            // 3. Update UI
            // Use the returned data from Supabase to ensure we have IDs and correct formatting if needed.
            // But for now, we can just use the parsed data or the returned data.
            // The prompt says "Pass the new expense data back up".
            // Ideally we pass the data returned from Supabase which includes IDs.
            // Assuming `data` is the inserted rows.

            // Need to map back to Expense interface if DB columns differ
            const newExpenses = (data as any[]).map(row => ({
                id: row.id,
                item_name: row.item_name,
                amount: row.amount,
                category: row.category,
                type: row.type,
                date: row.date
            }));

            onExpenseAdded(newExpenses);
            setNotes('');
        } catch (error: any) {
            console.error('Error processing expenses:', error);
            alert(error.message || 'Failed to process expenses.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md space-y-4">
            <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
                <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Add Expense</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Notes
                        </label>
                        <textarea
                            id="notes"
                            rows={4}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="e.g. Spent $15 on lunch at Joe's"
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !notes.trim()}
                        className="w-full py-2 px-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Processing...' : 'Add Expense'}
                    </button>
                    {funnyComment && (
                        <div className="text-lg font-semibold text-center mt-6 text-amber-500 animate-in fade-in slide-in-from-top-2">
                            {funnyComment}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
