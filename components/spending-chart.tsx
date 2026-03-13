'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Expense } from './expense-table';
import { MonthlyRoast } from './monthly-roast';

interface SpendingChartProps {
    expenses: Expense[];
}

export function SpendingChart({ expenses }: SpendingChartProps) {
    const hasData = expenses.length > 0;

    const data = useMemo(() => {
        const needs = expenses.filter(e => e.type === 'Need').reduce((sum, e) => sum + e.amount, 0);
        const wants = expenses.filter(e => e.type === 'Want').reduce((sum, e) => sum + e.amount, 0);
        return [
            { name: 'Need', value: needs, color: '#22c55e' },
            { name: 'Want', value: wants, color: '#eab308' },
        ];
    }, [expenses]);

    return (
        <div className="w-full p-4 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Lego vs. Life Ratio</h2>
                <MonthlyRoast expenses={expenses} />
            </div>

            {hasData ? (
                <>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                    isAnimationActive={true}
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => `$${value.toFixed(2)}`}
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: '8px',
                                        border: 'none',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    }}
                                    itemStyle={{ color: '#18181b' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
                            <span className="text-zinc-600 dark:text-zinc-400">Needs</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#eab308]" />
                            <span className="text-zinc-600 dark:text-zinc-400">Wants</span>
                        </div>
                    </div>
                </>
            ) : (
                <div className="h-[250px] flex flex-col items-center justify-center gap-3 text-zinc-400 dark:text-zinc-500">
                    <span className="text-4xl">📊</span>
                    <p className="text-sm text-center leading-relaxed">
                        Add your first expense to see your<br />Needs vs Wants breakdown
                    </p>
                </div>
            )}
        </div>
    );
}
