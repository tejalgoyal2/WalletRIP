'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/toast';
import { createClient } from '@/utils/supabase/client';
import { Expense } from './expense-table';

const MAX_CHARS = 5000;
const MAX_EXPENSES = 50;

interface ParsedExpense {
  is_expense: boolean;
  item_name: string | null;
  amount: number | null;
  category: string | null;
  type: 'Need' | 'Want' | null;
  date: string | null;
  emoji: string | null;
  funny_comment: string;
}

interface BulkImportModalProps {
  onImported: (expenses: Expense[]) => void;
}

function sanitizeInput(raw: string): string {
  // Strip ASCII control characters (except tab, LF, CR), trim, cap length
  return raw.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim().slice(0, MAX_CHARS);
}

export function BulkImportModal({ onImported }: BulkImportModalProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [stage, setStage] = useState<'input' | 'preview'>('input');
  const [parsedItems, setParsedItems] = useState<ParsedExpense[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setText('');
      setStage('input');
      setParsedItems([]);
      setSelected(new Set());
    }, 300);
  };

  const handlePreview = async () => {
    const sanitized = sanitizeInput(text);
    if (!sanitized) return;

    setIsParsing(true);
    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: sanitized,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to parse expenses');
      }

      const all: ParsedExpense[] = await response.json();
      const expenses = all.filter(e => e.is_expense).slice(0, MAX_EXPENSES);

      if (expenses.length === 0) {
        toast({ message: 'No valid expenses found — try being more specific with amounts', type: 'error' });
        return;
      }

      setParsedItems(expenses);
      setSelected(new Set(expenses.map((_, i) => i)));
      setStage('preview');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to parse';
      toast({ message, type: 'error' });
    } finally {
      setIsParsing(false);
    }
  };

  const toggleAll = () => {
    setSelected(prev =>
      prev.size === parsedItems.length ? new Set() : new Set(parsedItems.map((_, i) => i))
    );
  };

  const toggleOne = (index: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const handleImport = async () => {
    const toImport = parsedItems.filter((_, i) => selected.has(i));
    if (toImport.length === 0) return;

    setIsImporting(true);
    try {
      const supabase = createClient();
      const dbExpenses = toImport.map(exp => ({
        item_name: exp.item_name,
        amount: exp.amount,
        category: exp.category,
        type: exp.type,
        date: exp.date,
        emoji: exp.emoji,
      }));

      const { data, error } = await supabase.from('expenses').insert(dbExpenses).select();
      if (error) throw new Error('Database Error: ' + error.message);

      const newExpenses = (data as Expense[]).map(row => ({
        id: row.id,
        item_name: row.item_name,
        amount: row.amount,
        category: row.category,
        type: row.type,
        date: row.date,
        emoji: row.emoji,
      }));

      onImported(newExpenses);
      toast({ message: `Imported ${newExpenses.length} expense${newExpenses.length !== 1 ? 's' : ''}`, type: 'success' });
      handleClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Import failed';
      toast({ message, type: 'error' });
    } finally {
      setIsImporting(false);
    }
  };

  const selectedCount = selected.size;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1 text-xs font-medium text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 border border-zinc-200 dark:border-zinc-800 rounded-full hover:border-blue-200 dark:hover:border-blue-900 transition-colors"
      >
        Bulk Import 📋
      </button>

      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bulk-import-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                <div>
                  <h2 id="bulk-import-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    Bulk Import
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {stage === 'input'
                      ? 'Paste expenses, bank statement lines, or a list of transactions'
                      : `Found ${parsedItems.length} expense${parsedItems.length !== 1 ? 's' : ''} — select which to import`}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  aria-label="Close"
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors ml-4 mt-0.5"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto flex-1 p-6">
                {stage === 'input' ? (
                  <div className="space-y-2">
                    <textarea
                      value={text}
                      onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
                      placeholder={`Type or paste expenses, one per line:\n\ncoffee $5\nuber to airport 34 usd\nnetflix 17.99\n\nOr paste raw bank statement lines:\n2024-01-15  STARBUCKS #123  -5.60\n2024-01-16  UBER *TRIP  -28.40\n2024-01-17  WHOLEFDS MKT  -67.23`}
                      className="w-full h-52 p-3 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono placeholder:font-sans"
                      disabled={isParsing}
                      spellCheck={false}
                    />
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className={text.length > MAX_CHARS * 0.9 ? 'text-amber-500' : ''}>
                        {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} chars
                      </span>
                      <span>Max {MAX_EXPENSES} expenses per import</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Select all row */}
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 text-xs text-zinc-500 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={selectedCount === parsedItems.length && parsedItems.length > 0}
                          onChange={toggleAll}
                          className="rounded"
                        />
                        Select all
                      </label>
                      <span className="text-xs text-zinc-400">{selectedCount} of {parsedItems.length} selected</span>
                    </div>

                    {/* Preview list */}
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                      {parsedItems.map((exp, i) => (
                        <label
                          key={i}
                          className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                            selected.has(i)
                              ? 'bg-zinc-50 dark:bg-zinc-800/50'
                              : 'bg-white dark:bg-zinc-900 opacity-40'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected.has(i)}
                            onChange={() => toggleOne(i)}
                            className="rounded shrink-0"
                          />
                          <span className="text-xl shrink-0">{exp.emoji || '💸'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                              {exp.item_name}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                              <span className="text-xs text-zinc-400">{exp.date}</span>
                              <span className="text-xs text-zinc-500 dark:text-zinc-400">{exp.category}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                exp.type === 'Need'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              }`}>
                                {exp.type}
                              </span>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 shrink-0">
                            ${exp.amount?.toFixed(2)}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-3 shrink-0">
                {stage === 'preview' && (
                  <button
                    onClick={() => setStage('input')}
                    disabled={isImporting}
                    className="px-4 py-2 text-sm font-medium bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-md transition-colors disabled:opacity-50"
                  >
                    ← Back
                  </button>
                )}
                <div className="flex-1" />
                {stage === 'input' ? (
                  <button
                    onClick={handlePreview}
                    disabled={!text.trim() || isParsing}
                    className="flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                  >
                    {isParsing ? <><span className="animate-spin">⏳</span> Parsing...</> : 'Preview →'}
                  </button>
                ) : (
                  <button
                    onClick={handleImport}
                    disabled={selectedCount === 0 || isImporting}
                    className="flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                  >
                    {isImporting
                      ? <><span className="animate-spin">⏳</span> Importing...</>
                      : `Import ${selectedCount} expense${selectedCount !== 1 ? 's' : ''}`}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
