import React from 'react';
import { Expense } from './expense-table';
import { differenceInCalendarDays, parseISO, subDays, isSameDay, format } from 'date-fns';

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

    // Generate last 7 days for the habit strip
    const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));

    const hasExpenseOnDate = (date: Date) => {
        return expenses.some(e => isSameDay(parseISO(e.date), date));
    };

    if (streak === 0 && expenses.length === 0) return null;

    return (
        <div className="flex items-center gap-4">
            {/* Fire Badge */}
            {streak > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                    <span className="text-lg animate-pulse">🔥</span>
                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                        {streak} Day Streak
                    </span>
                </div>
            )}

            {/* Habit Strip (Last 7 Days) */}
            <div className="flex items-center gap-1.5">
                {last7Days.map((date, i) => {
                    const active = hasExpenseOnDate(date);
                    return (
                        <div
                            key={i}
                            title={format(date, 'MMM d')}
                            className={`
                                w-2.5 h-2.5 rounded-full transition-colors
                                ${active
                                    ? 'bg-green-500'
                                    : 'bg-zinc-300 dark:bg-zinc-700 opacity-30'
                                }
                            `}
                        />
                    );
                })}
            </div>
        </div>
    );
}
