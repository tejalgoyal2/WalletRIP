"use client";

import { useState, useEffect } from "react";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseTable, Expense } from "@/components/expense-table";
import { SpendingChart } from "@/components/spending-chart";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";

export function DashboardContent() {
    const [expenses, setExpenses] = useState<Expense[]>([]);

    useEffect(() => {
        const fetchExpenses = async () => {
            const supabase = createClient();
            const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });

            if (error) {
                console.error('Error fetching expenses:', error);
            } else if (data) {
                // Ensure data matches Expense type. Supabase returns any[], so we might need casting or validation.
                // For now, assuming the DB schema matches the frontend type.
                setExpenses(data as unknown as Expense[]);
            }
        };

        fetchExpenses();
    }, []);

    const handleExpenseAdded = (newExpenses: Expense[]) => {
        setExpenses((prev) => [...newExpenses, ...prev]);
    };

    return (
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
                <ExpenseTable expenses={expenses} />
            </div>
        </motion.div>
    );
}
