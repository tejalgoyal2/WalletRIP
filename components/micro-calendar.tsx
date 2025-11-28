import React, { useState } from 'react';
import { Expense } from './expense-table';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    parseISO,
    addMonths,
    subMonths,
    getDay
} from 'date-fns';

interface MicroCalendarProps {
    expenses: Expense[];
}

export function MicroCalendar({ expenses }: MicroCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Calculate starting empty slots (Sunday = 0)
    const startOffset = getDay(monthStart);
    const emptySlots = Array.from({ length: startOffset });

    const hasExpenseOnDate = (date: Date) => {
        return expenses.some(e => isSameDay(parseISO(e.date), date));
    };

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    return (
        <div className="flex flex-col items-center gap-1 p-2 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between w-full px-1">
                <button onClick={prevMonth} className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1">
                    ◀
                </button>
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {format(currentDate, 'MMMM yyyy')}
                </span>
                <button onClick={nextMonth} className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1">
                    ▶
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {/* Weekday Headers (Optional, maybe too cluttered for "micro") */}
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <div key={d} className="text-[0.5rem] text-center text-zinc-400">{d}</div>
                ))}

                {/* Empty Slots */}
                {emptySlots.map((_, i) => (
                    <div key={`empty-${i}`} />
                ))}

                {/* Days */}
                {daysInMonth.map((date, i) => {
                    const active = hasExpenseOnDate(date);
                    return (
                        <div
                            key={i}
                            title={format(date, 'MMM d, yyyy')}
                            className={`
                                w-2 h-2 rounded-full transition-colors mx-auto
                                ${active
                                    ? 'bg-green-500'
                                    : 'bg-zinc-200 dark:bg-zinc-800'
                                }
                            `}
                        />
                    );
                })}
            </div>
        </div>
    );
}
