import React from 'react';
import { Expense } from './expense-table';
import { format } from 'date-fns';

interface CsvExportProps {
    expenses: Expense[];
}

export function CsvExport({ expenses }: CsvExportProps) {
    const handleExport = () => {
        if (!expenses.length) return;

        const headers = ['Date', 'Item', 'Category', 'Type', 'Amount', 'Emoji'];
        const rows = expenses.map(e => [
            e.date,
            `"${e.item_name.replace(/"/g, '""')}"`, // Escape quotes
            e.category,
            e.type,
            e.amount.toFixed(2),
            e.emoji || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        const filename = `walletrip_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <button
            onClick={handleExport}
            disabled={!expenses.length}
            className="px-3 py-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-full hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Export CSV 📉
        </button>
    );
}
