import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardContent } from '@/components/dashboard-content'
import { SignOutButton } from "@/components/sign-out-button"
import { Github } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    redirect('/login')
  }

  const callsign = user.user_metadata?.callsign || user.email?.split('@')[0] || 'User'
  const isAdmin = user.email?.toLowerCase().startsWith('tejpol@')

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100">
      <div className="w-full max-w-5xl space-y-8">
        <header className="flex flex-col gap-2 mb-12">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">SpendLog Dashboard</h1>
            {isAdmin && <span className="text-2xl" title="Admin Access">👑</span>}
            <div className="ml-auto flex items-center gap-2">
              <a
                href="https://github.com/tejalgoyal2/WalletRIP"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors p-2"
                title="View Documentation"
              >
                <Github className="w-5 h-5" />
              </a>
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
  )
}
