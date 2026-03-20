"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Score {
    id: string;
    score: number;
    played_date: string;
    created_at: string;
}

export default function ScoresPage() {
    const [scores, setScores] = useState<Score[]>([]);
    const [newScore, setNewScore] = useState("");
    const [playedDate, setPlayedDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [subscriptionStatus, setSubscriptionStatus] = useState<string>("free");
    const supabase = createClient();

    const fetchScores = useCallback(async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch subscription status
        const { data: profile } = await supabase
            .from("profiles")
            .select("subscription_status")
            .eq("id", user.id)
            .single();
        if (profile) setSubscriptionStatus(profile.subscription_status);

        // Fetch scores
        const { data } = await supabase
            .from("scores")
            .select("*")
            .eq("user_id", user.id)
            .order("played_date", { ascending: false })
            .order("created_at", { ascending: false });

        if (data) setScores(data);
        setFetchLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchScores();
    }, [fetchScores]);

    const handleAddScore = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const scoreNum = parseInt(newScore);
        if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
            setError("Score must be between 1 and 45");
            return;
        }

        setLoading(true);
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            // If user already has 5 scores, delete the oldest one
            if (scores.length >= 5) {
                const oldestScore = scores[scores.length - 1];
                await supabase.from("scores").delete().eq("id", oldestScore.id);
            }

            // Insert new score
            const { error: insertError } = await supabase.from("scores").insert({
                user_id: user.id,
                score: scoreNum,
                played_date: playedDate,
            });

            if (insertError) {
                setError(insertError.message);
            } else {
                setSuccess(`Score ${scoreNum} added successfully!`);
                setNewScore("");
                setPlayedDate(new Date().toISOString().split("T")[0]);
                await fetchScores();
            }
        } finally {
            setLoading(false);
        }
    };

    if (subscriptionStatus !== "active" && !fetchLoading) {
        return (
            <div className="p-6 md:p-8">
                <div className="max-w-lg mx-auto text-center animate-fade-in-up">
                    <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">🔒</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-3">Premium Feature</h1>
                    <p className="text-muted mb-6">
                        Score tracking is available for premium subscribers. Upgrade your
                        plan to start entering and tracking your golf scores.
                    </p>
                    <a href="/dashboard/subscribe" className="btn-primary inline-block">
                        Upgrade to Premium →
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
                        <span className="gradient-text">Score Tracker</span>
                    </h1>
                    <p className="text-muted mt-1">
                        Enter your golf scores (1-45). Your latest 5 scores are kept for
                        draws.
                    </p>
                </div>

                {/* Score entry form */}
                <div
                    className="glass-card p-6 mb-6 animate-fade-in-up"
                    style={{ animationDelay: "0.1s" }}
                >
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span>⛳</span> Enter New Score
                    </h2>
                    <form onSubmit={handleAddScore} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="score"
                                    className="block text-sm font-medium text-foreground/80 mb-1.5"
                                >
                                    Score (1-45)
                                </label>
                                <input
                                    id="score"
                                    type="number"
                                    min={1}
                                    max={45}
                                    value={newScore}
                                    onChange={(e) => setNewScore(e.target.value)}
                                    placeholder="Enter your score"
                                    className="input-field"
                                    required
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="date"
                                    className="block text-sm font-medium text-foreground/80 mb-1.5"
                                >
                                    Date Played
                                </label>
                                <input
                                    id="date"
                                    type="date"
                                    value={playedDate}
                                    onChange={(e) => setPlayedDate(e.target.value)}
                                    className="input-field"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm animate-fade-in">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-success text-sm animate-fade-in">
                                {success}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary text-sm"
                        >
                            {loading ? "Saving..." : "Add Score"}
                        </button>

                        <p className="text-xs text-muted">
                            📝 Only your latest 5 scores are kept. Adding a new score when you
                            have 5 will replace the oldest one.
                        </p>
                    </form>
                </div>

                {/* Score history */}
                <div
                    className="glass-card p-6 animate-fade-in-up"
                    style={{ animationDelay: "0.2s" }}
                >
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span>📊</span> Your Scores
                        <span className="text-sm font-normal text-muted">
                            ({scores.length}/5)
                        </span>
                    </h2>

                    {fetchLoading ? (
                        <div className="text-center py-8 text-muted">Loading scores...</div>
                    ) : scores.length === 0 ? (
                        <div className="text-center py-8">
                            <span className="text-4xl mb-3 block">🏌️</span>
                            <p className="text-muted">
                                No scores yet. Enter your first score above!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {scores.map((score, i) => (
                                <div
                                    key={score.id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/8 transition-colors"
                                    style={{ animationDelay: `${i * 0.05}s` }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center font-bold text-lg text-primary">
                                            {score.score}
                                        </div>
                                        <div>
                                            <p className="font-medium">Score: {score.score}</p>
                                            <p className="text-sm text-muted">
                                                {new Date(score.played_date).toLocaleDateString(
                                                    "en-US",
                                                    {
                                                        weekday: "short",
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                    }
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-muted">#{i + 1}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Score balls visualization */}
                    {scores.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-card-border">
                            <p className="text-sm text-muted mb-3">
                                Your draw numbers:
                            </p>
                            <div className="flex flex-wrap gap-3">
                                {scores.map((score) => (
                                    <div
                                        key={score.id}
                                        className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white text-lg shadow-lg"
                                    >
                                        {score.score}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
