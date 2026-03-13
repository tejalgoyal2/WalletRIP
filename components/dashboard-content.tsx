"use client";

import { useState, useEffect } from "react";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseTable, Expense } from "@/components/expense-table";
import { SpendingChart } from "@/components/spending-chart";
import { StreakCounter } from "@/components/streak-counter";
import { CsvExport } from "@/components/csv-export";
import { SubscriptionHunter } from "@/components/subscription-hunter";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";

export function DashboardContent() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        const fetchExpenses = async () => {
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
    }, []);

    const handleExpenseAdded = (newExpenses: Expense[]) => {
        setExpenses((prev) => [...newExpenses, ...prev]);
    };

    const handleDeleteExpense = async (id: string | number) => {
        const supabase = createClient();
        const { error } = await supabase.from('expenses').delete().eq('id', id);

        if (error) {
            console.error('[DashboardContent] delete error:', error);
            alert('Failed to delete expense');
        } else {
            setExpenses((prev) => prev.filter((e) => e.id !== id));
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
            <div className="flex items-center justify-center py-24 text-red-500 text-sm">
                Failed to load expenses: {fetchError}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-end items-center gap-4">
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
                <div className="md:col-span-1">
                    <ExpenseForm onExpenseAdded={handleExpenseAdded} />
                </div>
                <div className="md:col-span-2 space-y-8">
                    <SpendingChart expenses={expenses} />
                    <ExpenseTable expenses={expenses} onDelete={handleDeleteExpense} />
                </div>
            </motion.div>
        </div>
    );
}
