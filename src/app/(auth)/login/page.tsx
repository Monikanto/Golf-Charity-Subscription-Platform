"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <h2 className="text-xl font-semibold text-foreground mb-1">
                Welcome back
            </h2>
            <p className="text-muted text-sm mb-6">
                Sign in to your account to continue
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-foreground/80 mb-1.5"
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="input-field"
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-foreground/80 mb-1.5"
                    >
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="input-field"
                        required
                    />
                </div>

                {error && (
                    <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm animate-fade-in">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full text-center"
                >
                    {loading ? (
                        <span className="inline-flex items-center gap-2">
                            <svg
                                className="animate-spin h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                            </svg>
                            Signing in...
                        </span>
                    ) : (
                        "Sign In"
                    )}
                </button>
            </form>

            <p className="text-center text-sm text-muted mt-6">
                Don&apos;t have an account?{" "}
                <Link
                    href="/signup"
                    className="text-primary hover:text-primary-hover font-medium transition-colors"
                >
                    Sign up
                </Link>
            </p>
        </>
    );
}
