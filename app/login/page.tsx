'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [isSignUp, setIsSignUp] = useState(false)
    const [callsign, setCallsign] = useState('')
    const [secretCode, setSecretCode] = useState('')
    const [inviteCode, setInviteCode] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const email = `${callsign.toLowerCase().replace(/\s+/g, '')}@spendlog.app`

            if (isSignUp) {
                if (inviteCode !== 'GEMINI2025') {
                    throw new Error('Invalid Invite Code')
                }

                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password: secretCode,
                })
                if (signUpError) throw signUpError

                // Auto sign in after sign up or show success message
                // For simplicity, we'll try to sign in immediately or let the user know
                // But usually signUp returns a session if email confirmation is off.
                // If email confirmation is on, they can't login yet. 
                // Assuming email confirmation is OFF for this "Zero-Cost" setup or we just handle the flow.

            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password: secretCode,
                })
                if (signInError) throw signInError
            }

            router.push('/')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="flex border-b border-zinc-200 dark:border-zinc-800">
                    <button
                        onClick={() => setIsSignUp(false)}
                        className={`flex-1 py-4 text-sm font-medium transition-colors ${!isSignUp
                                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-b-2 border-zinc-900 dark:border-zinc-100'
                                : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                            }`}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => setIsSignUp(true)}
                        className={`flex-1 py-4 text-sm font-medium transition-colors ${isSignUp
                                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-b-2 border-zinc-900 dark:border-zinc-100'
                                : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                            }`}
                    >
                        Sign Up
                    </button>
                </div>

                <div className="p-8">
                    <h2 className="text-2xl font-bold text-center mb-6 text-zinc-900 dark:text-zinc-100">
                        {isSignUp ? 'Join SpendLog' : 'Welcome Back'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Callsign
                            </label>
                            <input
                                type="text"
                                value={callsign}
                                onChange={(e) => setCallsign(e.target.value)}
                                className="w-full p-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Maverick"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Secret Code
                            </label>
                            <input
                                type="password"
                                value={secretCode}
                                onChange={(e) => setSecretCode(e.target.value)}
                                className="w-full p-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {isSignUp && (
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    Invite Code
                                </label>
                                <input
                                    type="text"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value)}
                                    className="w-full p-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter invite code"
                                    required
                                />
                            </div>
                        )}

                        {error && (
                            <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 px-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Enter Dashboard'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
