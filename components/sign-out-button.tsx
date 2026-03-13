'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSignOut = async () => {
        setLoading(true)
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <button
            onClick={handleSignOut}
            disabled={loading}
            aria-label="Sign out"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors disabled:opacity-50"
        >
            {loading ? 'Signing out...' : 'Sign Out'}
        </button>
    )
}
