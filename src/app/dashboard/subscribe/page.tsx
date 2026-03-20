"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SubscribePage() {
    const [status, setStatus] = useState<string>("free");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = useMemo(() => createClient(), []);

    useEffect(() => {
        const fetchStatus = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from("profiles")
                    .select("subscription_status")
                    .eq("id", user.id)
                    .single();
                if (data) setStatus(data.subscription_status);
            }
        };
        fetchStatus();
    }, [supabase]);

    const handleSubscribe = async () => {
        setLoading(true);
        setError(null);
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
                setError("You must be logged in to subscribe.");
                return;
            }

            // Mock Stripe - directly update subscription status
            const { error: updateError } = await supabase
                .from("profiles")
                .update({
                    subscription_status: "active",
                    updated_at: new Date().toISOString(),
                })
                .eq("id", user.id);

            if (updateError) {
                console.error("Subscription error:", updateError);
                setError("Failed to subscribe. Please try again.");
            } else {
                setStatus("active");
                setSuccess(true);
            }
        } catch (err) {
            console.error("Subscription error:", err);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        setLoading(true);
        setError(null);
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
                setError("You must be logged in.");
                return;
            }

            const { error: updateError } = await supabase
                .from("profiles")
                .update({
                    subscription_status: "cancelled",
                    updated_at: new Date().toISOString(),
                })
                .eq("id", user.id);

            if (updateError) {
                console.error("Cancel error:", updateError);
                setError("Failed to cancel subscription. Please try again.");
            } else {
                setStatus("cancelled");
            }
        } catch (err) {
            console.error("Cancel error:", err);
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="p-6 md:p-8">
                <div className="max-w-lg mx-auto text-center animate-fade-in-up">
                    <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                        <span className="text-4xl">🎉</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-3">
                        Welcome to <span className="gradient-text">Premium!</span>
                    </h1>
                    <p className="text-muted mb-6">
                        Your subscription is now active. You have full access to score
                        tracking, draw participation, and charity features.
                    </p>
                    <a href="/dashboard" className="btn-primary inline-block">
                        Go to Dashboard →
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 animate-fade-in-up">
                    <h1 className="text-3xl font-bold">
                        <span className="gradient-text">Subscription</span>
                    </h1>
                    <p className="text-muted mt-1">
                        Unlock all features with a premium subscription
                    </p>
                </div>

                {/* Error message */}
                {error && (
                    <div className="glass-card p-4 mb-6 border-red-500/30 bg-red-500/10 flex items-center gap-3 animate-fade-in">
                        <span className="text-2xl">❌</span>
                        <p className="text-sm text-red-400">{error}</p>
                    </div>
                )}

                {/* Current status */}
                {status !== "free" && (
                    <div
                        className={`glass-card p-4 mb-6 flex items-center gap-3 animate-fade-in ${status === "active" ? "border-success/30" : "border-accent/30"
                            }`}
                    >
                        <span className="text-2xl">
                            {status === "active" ? "✅" : "⚠️"}
                        </span>
                        <div>
                            <p className="font-semibold">
                                {status === "active"
                                    ? "Your subscription is active"
                                    : "Your subscription was cancelled"}
                            </p>
                            <p className="text-sm text-muted">
                                {status === "active"
                                    ? "You have access to all premium features"
                                    : "Resubscribe to regain access to premium features"}
                            </p>
                        </div>
                    </div>
                )}

                {/* Pricing cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Free Plan */}
                    <div
                        className={`glass-card p-6 ${status === "free" ? "border-primary/30" : ""
                            }`}
                    >
                        <div className="mb-4">
                            <span className="text-sm font-medium text-muted uppercase tracking-wider">
                                Free
                            </span>
                            <div className="flex items-baseline gap-1 mt-2">
                                <span className="text-4xl font-bold">€0</span>
                                <span className="text-muted">/month</span>
                            </div>
                        </div>
                        <ul className="space-y-3 mb-6">
                            {[
                                "View dashboard",
                                "Browse charities",
                                "Limited score viewing",
                            ].map((f, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm">
                                    <span className="text-primary">✓</span> {f}
                                </li>
                            ))}
                            {[
                                "Enter scores",
                                "Participate in draws",
                                "Win prizes",
                            ].map((f, i) => (
                                <li
                                    key={i}
                                    className="flex items-center gap-2 text-sm text-muted line-through"
                                >
                                    <span className="text-muted">✗</span> {f}
                                </li>
                            ))}
                        </ul>
                        {status === "free" && (
                            <div className="text-center text-sm text-muted py-2">
                                Current plan
                            </div>
                        )}
                    </div>

                    {/* Premium Plan */}
                    <div className="glass-card p-6 border-primary/30 relative overflow-hidden">
                        <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                            Recommended
                        </div>
                        <div className="mb-4">
                            <span className="text-sm font-medium text-primary uppercase tracking-wider">
                                Premium
                            </span>
                            <div className="flex items-baseline gap-1 mt-2">
                                <span className="text-4xl font-bold gradient-text">€9.99</span>
                                <span className="text-muted">/month</span>
                            </div>
                        </div>
                        <ul className="space-y-3 mb-6">
                            {[
                                "Everything in Free",
                                "Enter golf scores (1-45)",
                                "Participate in monthly draws",
                                "Win jackpot prizes",
                                "Charity contributions",
                                "Full score history",
                            ].map((f, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm">
                                    <span className="text-primary">✓</span> {f}
                                </li>
                            ))}
                        </ul>

                        {status === "active" ? (
                            <button
                                onClick={handleCancel}
                                disabled={loading}
                                className="btn-secondary w-full text-center text-sm"
                            >
                                {loading ? "Processing..." : "Cancel Subscription"}
                            </button>
                        ) : (
                            <button
                                onClick={handleSubscribe}
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
                                        Processing...
                                    </span>
                                ) : (
                                    "Subscribe Now →"
                                )}
                            </button>
                        )}

                        <p className="text-xs text-muted text-center mt-3">
                            Mock payment — no real charges
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
