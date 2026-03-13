"use client";

import { useState, useEffect } from "react";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseTable, Expense } from "@/components/expense-table";
import { SpendingChart } from "@/components/spending-chart";
import { StreakCounter } from "@/components/streak-counter";
import { CsvExport } from "@/components/csv-export";
import { SubscriptionHunter } from "@/components/subscription-hunter";
import { InsightsCard } from "@/components/insights-card";
import { TrendsChart } from "@/components/trends-chart";
import { BulkImportModal } from "@/components/bulk-import-modal";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/toast";
import { motion } from "framer-motion";

export function DashboardContent() {
    const { toast } = useToast();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        const fetchExpenses = async () => {
            setIsLoading(true);
            setFetchError(null);
            try {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from('expenses')
                    .select('*')
                    .order('date', { ascending: false });
                if (error) throw error;
                setExpenses(data as unknown as Expense[]);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to load expenses';
                console.error('[DashboardContent] fetch error:', message);
                setFetchError(message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchExpenses();
    }, [retryCount]);

    const handleExpenseAdded = (newExpenses: Expense[]) => {
        setExpenses(prev => [...newExpenses, ...prev]);
    };

    const handleDeleteExpense = async (id: string | number) => {
        const supabase = createClient();
        const { error } = await supabase.from('expenses').delete().eq('id', id);
        if (error) {
            console.error('[DashboardContent] delete error:', error);
            toast({ message: 'Failed to delete expense', type: 'error' });
        } else {
            setExpenses(prev => prev.filter(e => e.id !== id));
            toast({ message: 'Expense deleted', type: 'success' });
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24 text-zinc-400">
                <span className="animate-spin mr-3 text-2xl">⏳</span>
                Loading your expenses...
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <p className="text-red-500 text-sm">Failed to load expenses: {fetchError}</p>
                <button
                    onClick={() => setRetryCount(c => c + 1)}
                    className="px-4 py-2 text-sm font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md hover:opacity-90 transition-opacity"
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap justify-end items-center gap-2 sm:gap-4">
                <BulkImportModal onImported={handleExpenseAdded} />
                <SubscriptionHunter expenses={expenses} />
                <CsvExport expenses={expenses} />
                <StreakCounter expenses={expenses} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
                <div className="md:col-span-1 space-y-6">
                    <ExpenseForm onExpenseAdded={handleExpenseAdded} />
                    <InsightsCard expenses={expenses} />
                </div>
                <div className="md:col-span-2 space-y-8">
                    <SpendingChart expenses={expenses} />
                    <TrendsChart expenses={expenses} />
                    <ExpenseTable expenses={expenses} onDelete={handleDeleteExpense} />
                </div>
            </motion.div>
        </div>
    );
}
