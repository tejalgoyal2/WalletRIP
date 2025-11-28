import React, { useState } from 'react';
import { Expense } from './expense-table';
import { createClient } from '@/utils/supabase/client';
import { motion } from 'framer-motion';

interface ExpenseFormProps {
    onExpenseAdded: (expenses: Expense[]) => void;
}

export function ExpenseForm({ onExpenseAdded }: ExpenseFormProps) {
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [funnyComment, setFunnyComment] = useState<string | null>(null);
    const [isPanic, setIsPanic] = useState(false);
    const [evasionCount, setEvasionCount] = useState(0);
    const [buttonPos, setButtonPos] = useState({ x: 0, y: 0 });
    const [pendingExpenses, setPendingExpenses] = useState<any[] | null>(null);

    const handleEvade = () => {
        if (isPanic && evasionCount < 5) {
            const x = Math.random() * 200 - 100;
            const y = Math.random() * 200 - 100;
            setButtonPos({ x, y });
            setEvasionCount(prev => prev + 1);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // If in panic mode and evasion count is high enough, or not in panic mode
        if (isPanic) {
            if (evasionCount >= 5 && pendingExpenses) {
                // Proceed with saving pending expenses
                await saveExpenses(pendingExpenses);
                setIsPanic(false);
                setEvasionCount(0);
                setButtonPos({ x: 0, y: 0 });
                setPendingExpenses(null);
            }
            return;
        }

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

            // Check for Panic Mode trigger
            const expense = parsedExpenses[0];
            if (expense.amount > 100 && expense.type === 'Want') {
                setIsPanic(true);
                setPendingExpenses(parsedExpenses);
                setIsLoading(false);
                return; // Stop here and wait for user to chase the button
            }

            // If not panic, save immediately
            await saveExpenses(parsedExpenses);

        } catch (error: any) {
            console.error('Error processing expenses:', error);
            alert(error.message || 'Failed to process expenses.');
            setIsLoading(false);
        }
    };

    const saveExpenses = async (expensesToSave: any[]) => {
        try {
            // 2. Save to Supabase
            const supabase = createClient();

            // Map to DB schema
            const dbExpenses = expensesToSave.map(exp => ({
                item_name: exp.item_name, // Now matching API response
                amount: exp.amount,
                category: exp.category,
                type: exp.type,
                date: exp.date,
                emoji: exp.emoji
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
            // Need to map back to Expense interface if DB columns differ
            const newExpenses = (data as any[]).map(row => ({
                id: row.id,
                item_name: row.item_name,
                amount: row.amount,
                category: row.category,
                type: row.type,
                date: row.date,
                emoji: row.emoji
            }));

            onExpenseAdded(newExpenses);
            setNotes('');
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
                    <div className="relative h-12">
                        <motion.button
                            type="submit"
                            animate={{ x: buttonPos.x, y: buttonPos.y }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            onHoverStart={handleEvade}
                            onTouchStart={handleEvade}
                            disabled={isLoading || !notes.trim()}
                            className={`w-full py-2 px-4 font-medium rounded-md hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed absolute top-0 left-0 ${isPanic
                                ? 'bg-amber-600 text-white'
                                : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                                }`}
                        >
                            {isLoading ? 'Processing...' : isPanic ? 'Really? 💸' : 'Add Expense'}
                        </motion.button>
                    </div>
                    {funnyComment && (
                        <div className="text-lg italic font-medium text-center mt-6 text-amber-500 animate-in fade-in slide-in-from-top-2">
                            {funnyComment}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
