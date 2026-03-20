"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    subscription_status: string;
    created_at: string;
}

interface Draw {
    id: string;
    numbers: number[];
    created_at: string;
}

interface Winner {
    id: string;
    user_id: string;
    draw_id: string;
    matched_numbers: number[];
    match_count: number;
    reward_tier: string;
    status: string;
}

export default function AdminPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [draws, setDraws] = useState<Draw[]>([]);
    const [winners, setWinners] = useState<Winner[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [runningDraw, setRunningDraw] = useState(false);
    const [drawResult, setDrawResult] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"users" | "draws" | "winners">(
        "users"
    );
    const supabase = createClient();

    const fetchData = useCallback(async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Check admin
        const { data: profile } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .single();

        if (!profile?.is_admin) {
            setLoading(false);
            return;
        }
        setIsAdmin(true);

        // Fetch all users
        const { data: usersData } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });
        if (usersData) setUsers(usersData);

        // Fetch draws
        const { data: drawsData } = await supabase
            .from("draws")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(20);
        if (drawsData) setDraws(drawsData);

        // Fetch winners
        const { data: winnersData } = await supabase
            .from("winners")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50);
        if (winnersData) setWinners(winnersData);

        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRunDraw = async () => {
        setRunningDraw(true);
        setDrawResult(null);
        try {
            const res = await fetch("/api/draws", { method: "POST" });
            const data = await res.json();

            if (res.ok) {
                setDrawResult(
                    `Draw completed! Numbers: ${data.draw.numbers.join(", ")}. ${data.winners.length
                    } winner(s) from ${data.totalUsers} participants.`
                );
                await fetchData();
            } else {
                setDrawResult(`Error: ${data.error}`);
            }
        } catch {
            setDrawResult("Failed to run draw");
        } finally {
            setRunningDraw(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen gradient-bg flex items-center justify-center">
                <p className="text-muted">Loading admin panel...</p>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen gradient-bg flex items-center justify-center">
                <div className="text-center">
                    <span className="text-6xl mb-4 block">🚫</span>
                    <h1 className="text-2xl font-bold mb-2">Admin Access Required</h1>
                    <p className="text-muted mb-4">
                        You don&apos;t have permission to access this page.
                    </p>
                    <a href="/dashboard" className="btn-primary inline-block">
                        Go to Dashboard
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen gradient-bg">
            {/* Admin Header */}
            <div className="glass-card rounded-none border-x-0 border-t-0 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">⛳</span>
                        <div>
                            <h1 className="font-bold gradient-text">Admin Panel</h1>
                            <p className="text-xs text-muted">GolfCharity Management</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            href="/dashboard"
                            className="btn-secondary text-sm py-2 px-3"
                        >
                            ← Dashboard
                        </a>
                        <button
                            onClick={handleRunDraw}
                            disabled={runningDraw}
                            className="btn-primary text-sm py-2 px-4"
                        >
                            {runningDraw ? (
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
                                    Running...
                                </span>
                            ) : (
                                "🎲 Run Draw"
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
                {/* Draw result banner */}
                {drawResult && (
                    <div
                        className={`glass-card p-4 animate-fade-in ${drawResult.startsWith("Error")
                                ? "border-danger/30"
                                : "border-success/30"
                            }`}
                    >
                        <p className="text-sm">{drawResult}</p>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 animate-fade-in-up">
                    <div className="glass-card p-5 text-center">
                        <p className="text-3xl font-bold gradient-text">{users.length}</p>
                        <p className="text-sm text-muted mt-1">Total Users</p>
                    </div>
                    <div className="glass-card p-5 text-center">
                        <p className="text-3xl font-bold text-success">
                            {users.filter((u) => u.subscription_status === "active").length}
                        </p>
                        <p className="text-sm text-muted mt-1">Active Subscribers</p>
                    </div>
                    <div className="glass-card p-5 text-center">
                        <p className="text-3xl font-bold text-secondary">
                            {draws.length}
                        </p>
                        <p className="text-sm text-muted mt-1">Draws Run</p>
                    </div>
                    <div className="glass-card p-5 text-center">
                        <p className="text-3xl font-bold text-accent">
                            {winners.length}
                        </p>
                        <p className="text-sm text-muted mt-1">Total Winners</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-card-border pb-px">
                    {(["users", "draws", "winners"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium capitalize rounded-t-lg transition-colors ${activeTab === tab
                                    ? "text-primary border-b-2 border-primary bg-primary/5"
                                    : "text-muted hover:text-foreground"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                <div className="animate-fade-in">
                    {activeTab === "users" && (
                        <div className="glass-card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-card-border">
                                            <th className="text-left px-4 py-3 text-muted font-medium">
                                                Name
                                            </th>
                                            <th className="text-left px-4 py-3 text-muted font-medium">
                                                Email
                                            </th>
                                            <th className="text-left px-4 py-3 text-muted font-medium">
                                                Status
                                            </th>
                                            <th className="text-left px-4 py-3 text-muted font-medium">
                                                Joined
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr
                                                key={u.id}
                                                className="border-b border-card-border/50 hover:bg-white/5"
                                            >
                                                <td className="px-4 py-3 font-medium">
                                                    {u.full_name || "—"}
                                                </td>
                                                <td className="px-4 py-3 text-muted">{u.email}</td>
                                                <td className="px-4 py-3">
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${u.subscription_status === "active"
                                                                ? "bg-success/20 text-success"
                                                                : u.subscription_status === "cancelled"
                                                                    ? "bg-danger/20 text-danger"
                                                                    : "bg-white/10 text-muted"
                                                            }`}
                                                    >
                                                        {u.subscription_status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-muted">
                                                    {new Date(u.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === "draws" && (
                        <div className="space-y-4">
                            {draws.length === 0 ? (
                                <div className="text-center py-8 text-muted">
                                    No draws yet. Click &quot;Run Draw&quot; to create one.
                                </div>
                            ) : (
                                draws.map((draw) => (
                                    <div key={draw.id} className="glass-card p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-sm text-muted">
                                                {new Date(draw.created_at).toLocaleString()}
                                            </p>
                                            <p className="text-xs text-muted font-mono">
                                                {draw.id.slice(0, 8)}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {draw.numbers.map((num, i) => (
                                                <div
                                                    key={i}
                                                    className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white shadow-lg"
                                                >
                                                    {num}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === "winners" && (
                        <div className="glass-card overflow-hidden">
                            {winners.length === 0 ? (
                                <div className="text-center py-8 text-muted">
                                    No winners yet.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-card-border">
                                                <th className="text-left px-4 py-3 text-muted font-medium">
                                                    User
                                                </th>
                                                <th className="text-left px-4 py-3 text-muted font-medium">
                                                    Matches
                                                </th>
                                                <th className="text-left px-4 py-3 text-muted font-medium">
                                                    Tier
                                                </th>
                                                <th className="text-left px-4 py-3 text-muted font-medium">
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {winners.map((w) => (
                                                <tr
                                                    key={w.id}
                                                    className="border-b border-card-border/50 hover:bg-white/5"
                                                >
                                                    <td className="px-4 py-3 text-muted font-mono text-xs">
                                                        {w.user_id.slice(0, 8)}...
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {w.matched_numbers.join(", ")} ({w.match_count})
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`font-medium capitalize ${w.reward_tier === "jackpot"
                                                                    ? "text-accent"
                                                                    : w.reward_tier === "mid"
                                                                        ? "text-primary"
                                                                        : "text-success"
                                                                }`}
                                                        >
                                                            {w.reward_tier}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 capitalize text-muted">
                                                        {w.status}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
