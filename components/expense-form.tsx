import React, { useState } from 'react';
import { Expense } from './expense-table';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface ExpenseFormProps {
    onExpenseAdded: (expenses: Expense[]) => void;
}

export function ExpenseForm({ onExpenseAdded }: ExpenseFormProps) {
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [memeUrl, setMemeUrl] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!notes.trim()) return;

        setIsLoading(true);
        setMemeUrl(null); // Reset previous meme

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

            // Extract meme term and fetch GIF
            const term = parsedExpenses[0]?.meme_search_term;
            if (term) {
                const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY;
                if (apiKey) {
                    fetch(`https://api.giphy.com/v1/gifs/random?api_key=${apiKey}&tag=${encodeURIComponent(term)}&rating=pg-13`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.data?.images?.downsized_medium?.url) {
                                setMemeUrl(data.data.images.downsized_medium.url);
                                setTimeout(() => setMemeUrl(null), 4000);
                            }
                        })
                        .catch(err => console.error('Failed to fetch GIF:', err));
                }
            }

            // 2. Save to Supabase
            const supabase = createClient();

            // Map to DB schema (assuming column names: item_name, amount, category, type, date)
            const dbExpenses = parsedExpenses.map(exp => ({
                item_name: exp.item,
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
                item: row.item_name,
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
                </form>
            </div>

            <AnimatePresence>
                {memeUrl && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="w-full rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={memeUrl}
                                alt="Reaction Meme"
                                className="w-full h-48 object-cover"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
