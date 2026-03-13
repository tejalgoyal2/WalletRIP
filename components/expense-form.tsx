import { useState, useEffect, FormEvent } from 'react';
import { Expense } from './expense-table';
import { createClient } from '@/utils/supabase/client';
import { motion } from 'framer-motion';
import { useToast } from '@/components/toast';

const PLACEHOLDERS = [
    'coffee at starbucks $5',
    'uber to airport 34 usd',
    'netflix subscription 17.99 monthly',
    'lunch with coworkers $28',
];

interface ParsedExpense {
    is_expense: boolean;
    item_name: string | null;
    amount: number;
    category: string;
    type: 'Need' | 'Want';
    date: string;
    emoji: string | null;
    funny_comment: string;
}

interface ExpenseFormProps {
    onExpenseAdded: (expenses: Expense[]) => void;
}

export function ExpenseForm({ onExpenseAdded }: ExpenseFormProps) {
    const { toast } = useToast();
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [funnyComment, setFunnyComment] = useState<string | null>(null);
    const [isPanic, setIsPanic] = useState(false);
    const [evasionCount, setEvasionCount] = useState(0);
    const [buttonPos, setButtonPos] = useState({ x: 0, y: 0 });
    const [pendingExpenses, setPendingExpenses] = useState<ParsedExpense[] | null>(null);
    const [placeholderIndex, setPlaceholderIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIndex(i => (i + 1) % PLACEHOLDERS.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleEvade = () => {
        if (isPanic && evasionCount < 5) {
            setButtonPos({
                x: Math.random() * 200 - 100,
                y: Math.random() * 200 - 100,
            });
            setEvasionCount(prev => prev + 1);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isPanic) {
            if (evasionCount >= 5 && pendingExpenses) {
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
        setFunnyComment(null);

        try {
            const response = await fetch('/api/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: notes,
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to parse expense');
            }

            const parsedExpenses: ParsedExpense[] = await response.json();

            const comment = parsedExpenses[0]?.funny_comment;
            if (comment) {
                setFunnyComment(comment);
                setTimeout(() => setFunnyComment(null), 8000);
            }

            if (!parsedExpenses[0]?.is_expense) {
                setIsLoading(false);
                setNotes('');
                return;
            }

            const expense = parsedExpenses[0];
            if (expense.amount > 100 && expense.type === 'Want') {
                setIsPanic(true);
                setPendingExpenses(parsedExpenses);
                setIsLoading(false);
                return;
            }

            await saveExpenses(parsedExpenses);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to process expense';
            console.error('[ExpenseForm] parse error:', message);
            toast({ message, type: 'error' });
            setIsLoading(false);
        }
    };

    const saveExpenses = async (expensesToSave: ParsedExpense[]) => {
        try {
            const supabase = createClient();
            const dbExpenses = expensesToSave.map(exp => ({
                item_name: exp.item_name,
                amount: exp.amount,
                category: exp.category,
                type: exp.type,
                date: exp.date,
                emoji: exp.emoji,
            }));

            const { data, error } = await supabase.from('expenses').insert(dbExpenses).select();
            if (error) throw new Error('Database Error: ' + error.message);

            const newExpenses = (data as Expense[]).map(row => ({
                id: row.id,
                item_name: row.item_name,
                amount: row.amount,
                category: row.category,
                type: row.type,
                date: row.date,
                emoji: row.emoji,
            }));

            onExpenseAdded(newExpenses);
            setNotes('');
            toast({ message: 'Expense added!', type: 'success' });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to save expense';
            console.error('[ExpenseForm] save error:', message);
            toast({ message, type: 'error' });
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
                        <input
                            id="notes"
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={PLACEHOLDERS[placeholderIndex]}
                            disabled={isLoading}
                            autoComplete="off"
                        />
                        <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                            Just type naturally — amount, currency, and category are auto-detected by AI
                        </p>
                    </div>

                    {isPanic && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 text-center animate-pulse">
                            Chase the button to confirm this impulse buy...
                        </p>
                    )}

                    <div className="relative h-10">
                        <motion.button
                            type="submit"
                            animate={{ x: buttonPos.x, y: buttonPos.y }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            onHoverStart={handleEvade}
                            onTouchStart={handleEvade}
                            disabled={isLoading || !notes.trim()}
                            className={`w-full py-2 px-4 font-medium rounded-md hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed absolute top-0 left-0 ${
                                isPanic
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
