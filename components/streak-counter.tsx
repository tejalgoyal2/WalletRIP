import React from 'react';
import { Expense } from './expense-table';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { MicroCalendar } from './micro-calendar';

interface StreakCounterProps {
    expenses: Expense[];
}

export function StreakCounter({ expenses }: StreakCounterProps) {
    const calculateStreak = () => {
        if (!expenses.length) return 0;

        // Get unique dates, sorted descending
        const uniqueDates = Array.from(new Set(
            expenses.map(e => e.date)
        )).sort((a, b) => b.localeCompare(a));

        if (!uniqueDates.length) return 0;

        const today = new Date();
        const latestExpenseDate = parseISO(uniqueDates[0]);

        // Check if streak is alive (latest expense is today or yesterday)
        const diff = differenceInCalendarDays(today, latestExpenseDate);
        if (diff > 1) return 0;

        let streak = 1;
        for (let i = 0; i < uniqueDates.length - 1; i++) {
            const current = parseISO(uniqueDates[i]);
            const next = parseISO(uniqueDates[i + 1]);

            if (differenceInCalendarDays(current, next) === 1) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    };

    const streak = calculateStreak();

    // If no data at all, maybe don't show anything? 
    // Or show calendar anyway? Let's show calendar anyway if there are expenses, 
    // but the prompt implies replacing the strip.
    // If expenses is empty, calendar will be empty.

    return (
        <div className="flex items-start gap-4">
            {/* Fire Badge */}
            {streak > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 mt-1">
                    <span className="text-lg animate-pulse">🔥</span>
                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                        {streak} Day Streak
                    </span>
                </div>
            )}

            {/* Micro Calendar */}
            <MicroCalendar expenses={expenses} />
        </div>
    );
}
