'use client';

import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { parseISO, format, startOfWeek, startOfMonth } from 'date-fns';
import { Expense } from './expense-table';

interface TrendsChartProps {
  expenses: Expense[];
}

type ViewMode = 'weekly' | 'monthly';

interface DataPoint {
  label: string;
  needs: number;
  wants: number;
}

function groupExpenses(expenses: Expense[], view: ViewMode): DataPoint[] {
  const groups = new Map<string, DataPoint>();

  expenses.forEach(e => {
    let key: string;
    let label: string;
    try {
      const d = parseISO(e.date);
      if (view === 'weekly') {
        const week = startOfWeek(d, { weekStartsOn: 1 });
        key = format(week, 'yyyy-MM-dd');
        label = format(week, 'MMM d');
      } else {
        const month = startOfMonth(d);
        key = format(month, 'yyyy-MM');
        label = format(month, 'MMM yy');
      }
    } catch {
      return;
    }

    const existing = groups.get(key) ?? { label, needs: 0, wants: 0 };
    if (e.type === 'Need') existing.needs = parseFloat((existing.needs + e.amount).toFixed(2));
    else existing.wants = parseFloat((existing.wants + e.amount).toFixed(2));
    groups.set(key, existing);
  });

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);
}

export function TrendsChart({ expenses }: TrendsChartProps) {
  const [view, setView] = useState<ViewMode>('weekly');

  const data = useMemo(() => groupExpenses(expenses, view), [expenses, view]);
  const hasEnoughData = data.length >= 2;

  return (
    <div className="w-full p-4 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Spending Trends</h2>
        <div className="flex rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-700 text-xs">
          {(['weekly', 'monthly'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setView(mode)}
              className={`px-3 py-1 font-medium transition-colors capitalize ${
                view === mode
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {!hasEnoughData ? (
        <div className="h-[200px] flex flex-col items-center justify-center gap-2 text-zinc-400 dark:text-zinc-500">
          <span className="text-3xl">📈</span>
          <p className="text-sm text-center">Keep logging expenses to see trends</p>
        </div>
      ) : (
        <>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" opacity={0.25} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#71717a' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `$${v}`}
                  width={56}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `$${value.toFixed(2)}`,
                    name === 'needs' ? 'Needs' : 'Wants',
                  ]}
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#18181b' }}
                  cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                />
                <Bar dataKey="needs" stackId="a" fill="#22c55e" name="needs" radius={[0, 0, 0, 0]} maxBarSize={48} />
                <Bar dataKey="wants" stackId="a" fill="#eab308" name="wants" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#22c55e]" />
              <span className="text-zinc-500 dark:text-zinc-400">Needs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-[#eab308]" />
              <span className="text-zinc-500 dark:text-zinc-400">Wants</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
