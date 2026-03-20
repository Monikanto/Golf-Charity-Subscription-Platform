"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Draw {
    id: string;
    numbers: number[];
    status: string;
    created_at: string;
}

interface Winner {
    id: string;
    draw_id: string;
    matched_numbers: number[];
    match_count: number;
    reward_tier: string;
    status: string;
}

export default function DrawsPage() {
    const [draws, setDraws] = useState<Draw[]>([]);
    const [winners, setWinners] = useState<Winner[]>([]);
    const [userScores, setUserScores] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [subscriptionStatus, setSubscriptionStatus] = useState<string>("free");
    const supabase = createClient();

    const fetchData = useCallback(async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch profile
        const { data: profile } = await supabase
            .from("profiles")
            .select("subscription_status")
            .eq("id", user.id)
            .single();
        if (profile) setSubscriptionStatus(profile.subscription_status);

        // Fetch draws
        const { data: drawsData } = await supabase
            .from("draws")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10);
        if (drawsData) setDraws(drawsData);

        // Fetch user's wins
        const { data: winnersData } = await supabase
            .from("winners")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
        if (winnersData) setWinners(winnersData);

        // Fetch user scores
        const { data: scoresData } = await supabase
            .from("scores")
            .select("score")
            .eq("user_id", user.id);
        if (scoresData) setUserScores(scoresData.map((s) => s.score));

        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getRewardInfo = (tier: string) => {
        switch (tier) {
            case "jackpot":
                return { label: "🏆 Jackpot!", color: "text-accent", prize: "€10,000" };
            case "mid":
                return { label: "🥈 Mid-Tier", color: "text-primary", prize: "€500" };
            case "small":
                return { label: "🥉 Small Win", color: "text-success", prize: "€50" };
            default:
                return { label: "—", color: "text-muted", prize: "€0" };
        }
    };

    if (subscriptionStatus !== "active" && !loading) {
        return (
            <div className="p-6 md:p-8">
                <div className="max-w-lg mx-auto text-center animate-fade-in-up">
                    <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">🔒</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-3">Premium Feature</h1>
                    <p className="text-muted mb-6">
                        Draw participation is available for premium subscribers only.
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
                        <span className="gradient-text">Prize Draws</span>
                    </h1>
                    <p className="text-muted mt-1">
                        Match your scores with the draw numbers to win prizes!
                    </p>
                </div>

                {/* Your current numbers */}
                {userScores.length > 0 && (
                    <div
                        className="glass-card p-6 mb-6 animate-fade-in-up"
                        style={{ animationDelay: "0.1s" }}
                    >
                        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <span>🎯</span> Your Numbers
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {userScores.map((score, i) => (
                                <div
                                    key={i}
                                    className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white text-lg shadow-lg"
                                >
                                    {score}
                                </div>
                            ))}
                        </div>
                        {userScores.length < 5 && (
                            <p className="text-sm text-muted mt-3">
                                ⚠️ You have {userScores.length}/5 scores. Enter more scores to
                                maximize your chances!
                            </p>
                        )}
                    </div>
                )}

                {/* Your wins */}
                {winners.length > 0 && (
                    <div
                        className="glass-card p-6 mb-6 animate-fade-in-up"
                        style={{ animationDelay: "0.15s" }}
                    >
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <span>🏆</span> Your Winnings
                        </h2>
                        <div className="space-y-3">
                            {winners.map((win) => {
                                const reward = getRewardInfo(win.reward_tier);
                                return (
                                    <div
                                        key={win.id}
                                        className="flex items-center justify-between p-4 rounded-xl bg-white/5"
                                    >
                                        <div>
                                            <p className={`font-semibold ${reward.color}`}>
                                                {reward.label}
                                            </p>
                                            <p className="text-sm text-muted">
                                                Matched {win.match_count} numbers:{" "}
                                                {win.matched_numbers.join(", ")}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold text-lg ${reward.color}`}>
                                                {reward.prize}
                                            </p>
                                            <p className="text-xs text-muted capitalize">
                                                {win.status}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Draw history */}
                <div
                    className="glass-card p-6 animate-fade-in-up"
                    style={{ animationDelay: "0.2s" }}
                >
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span>🎲</span> Draw History
                    </h2>

                    {loading ? (
                        <div className="text-center py-8 text-muted">Loading draws...</div>
                    ) : draws.length === 0 ? (
                        <div className="text-center py-8">
                            <span className="text-4xl mb-3 block">🎲</span>
                            <p className="text-muted">
                                No draws yet. Stay tuned for the next monthly draw!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {draws.map((draw) => {
                                const userWin = winners.find((w) => w.draw_id === draw.id);
                                return (
                                    <div
                                        key={draw.id}
                                        className={`p-4 rounded-xl border ${userWin
                                                ? "bg-primary/5 border-primary/20"
                                                : "bg-white/5 border-transparent"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-sm text-muted">
                                                {new Date(draw.created_at).toLocaleDateString("en-US", {
                                                    weekday: "long",
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </p>
                                            {userWin && (
                                                <span
                                                    className={`text-sm font-medium ${getRewardInfo(userWin.reward_tier).color
                                                        }`}
                                                >
                                                    {getRewardInfo(userWin.reward_tier).label}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {draw.numbers.map((num, i) => {
                                                const isMatched =
                                                    userWin?.matched_numbers.includes(num);
                                                return (
                                                    <div
                                                        key={i}
                                                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${isMatched
                                                                ? "bg-gradient-to-br from-primary to-secondary text-white shadow-lg"
                                                                : "bg-white/10 text-muted"
                                                            }`}
                                                    >
                                                        {num}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Reward tiers info */}
                <div
                    className="glass-card p-6 mt-6 animate-fade-in-up"
                    style={{ animationDelay: "0.3s" }}
                >
                    <h2 className="text-lg font-semibold mb-4">🏅 Reward Tiers</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                            {
                                matches: 5,
                                tier: "Jackpot",
                                prize: "€10,000",
                                icon: "🏆",
                                color: "accent",
                            },
                            {
                                matches: 4,
                                tier: "Mid-Tier",
                                prize: "€500",
                                icon: "🥈",
                                color: "primary",
                            },
                            {
                                matches: 3,
                                tier: "Small Win",
                                prize: "€50",
                                icon: "🥉",
                                color: "success",
                            },
                        ].map((tier) => (
                            <div
                                key={tier.tier}
                                className="text-center p-4 rounded-xl bg-white/5"
                            >
                                <span className="text-3xl">{tier.icon}</span>
                                <p className="font-semibold mt-2">{tier.tier}</p>
                                <p className={`text-${tier.color} font-bold`}>{tier.prize}</p>
                                <p className="text-xs text-muted">
                                    {tier.matches} matches needed
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
