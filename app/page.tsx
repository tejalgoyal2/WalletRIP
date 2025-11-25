import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { DashboardContent } from "@/components/dashboard-content";
import { SignOutButton } from "@/components/sign-out-button";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // Extract callsign from email (callsign@spendlog.app) or metadata
  const callsign = user.user_metadata?.callsign || user.email?.split('@')[0] || '';
  const isAdmin = user.email?.toLowerCase().startsWith('tejpol@');

  // In a real app, we'd fetch expenses from Supabase here.
  // For now, we'll keep the client-side state in a separate client component wrapper 
  // OR just render the layout server-side and let the client components handle the interactive parts.
  // However, the previous implementation was a client component ("use client").
  // To mix server-side auth check and client-side state, we should probably make this a server component
  // and wrap the dashboard content in a client component.
  // BUT, to keep it simple and consistent with the previous step which had "use client" and state:
  // We can't make this file async if it's "use client".
  // So we have two options:
  // 1. Make this a Server Component, fetch user, pass to a new Client Component "Dashboard".
  // 2. Keep it Client Component, fetch user on mount (but we already have middleware protecting it).

  // The prompt asks to "Check the user's callsign... display a badge".
  // Since I need to read the user from the server to be secure/clean, I'll convert this page to a Server Component
  // and move the stateful logic to a new component `components/dashboard.tsx` or just keep the stateful parts in the form/table 
  // and lift state up to a client wrapper.

  // Let's create a client wrapper for the dashboard content.

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100">
      <div className="w-full max-w-5xl space-y-8">
        <header className="flex flex-col gap-2 mb-12">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">SpendLog Dashboard</h1>
            {isAdmin && <span className="text-2xl" title="Admin Access">👑</span>}
            <div className="ml-auto">
              <SignOutButton />
            </div>
          </div>
          <p className="text-zinc-500 dark:text-zinc-400">
            Welcome back, <span className="font-semibold text-zinc-900 dark:text-zinc-100 capitalize">{callsign}</span>.
          </p>
        </header>

        <DashboardContent />
      </div>
    </main>
  );
}

// We need a client component for the state. I'll define it here for simplicity or import it.
// Since I can't easily create a new file in the same `replace_file_content` call and I want to preserve the existing logic...
// I will create a new file `components/dashboard-content.tsx` in the next step and import it here.
// Wait, I can't leave this file broken. 
// I'll assume `DashboardContent` exists and create it immediately after.
