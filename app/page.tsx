import { ExpenseForm } from "@/components/expense-form";
import { ExpenseTable } from "@/components/expense-table";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100">
      <div className="w-full max-w-5xl space-y-8">
        <header className="flex flex-col gap-2 mb-12">
          <h1 className="text-3xl font-bold tracking-tight">SpendLog Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Track your expenses with AI-powered parsing.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <ExpenseForm />
          </div>
          <div className="md:col-span-2">
            <ExpenseTable />
          </div>
        </div>
      </div>
    </main>
  );
}
