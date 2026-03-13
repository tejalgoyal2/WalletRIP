'use client';

import { useState } from 'react';
import { subDays, parseISO } from 'date-fns';
import { useToast } from '@/components/toast';
import { Expense } from './expense-table';

interface InsightsCardProps {
  expenses: Expense[];
}

export function InsightsCard({ expenses }: InsightsCardProps) {
  const { toast } = useToast();
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const cutoff = subDays(new Date(), 30);
      const recent = expenses.filter(e => {
        try { return parseISO(e.date) >= cutoff; } catch { return false; }
      });

      if (recent.length === 0) {
        setInsight("Not enough data yet — add some expenses and come back!");
        return;
      }

      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expenses: recent }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate insights');
      }

      const data = await response.json();
      setInsight(data.insight);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate insights';
      toast({ message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full p-4 bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">AI Insights</h2>
        {insight && !isLoading && (
          <button
            onClick={() => { setInsight(null); handleGenerate(); }}
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            Refresh
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2 animate-pulse py-1">
          <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-full" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-5/6" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4" />
        </div>
      ) : insight ? (
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{insight}</p>
      ) : (
        <div className="flex flex-col items-center gap-3 py-2">
          <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center">
            Personalized AI summary of your last 30 days
          </p>
          <button
            onClick={handleGenerate}
            disabled={expenses.length === 0}
            className="px-4 py-1.5 text-sm font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generate Insights ✨
          </button>
        </div>
      )}
    </div>
  );
}
