import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("*, charities(name)")
        .eq("id", user.id)
        .single();

    // Fetch scores
    const { data: scores } = await supabase
        .from("scores")
        .select("*")
        .eq("user_id", user.id)
        .order("played_date", { ascending: false })
        .limit(5);

    // Fetch recent wins
    const { data: wins } = await supabase
        .from("winners")
        .select("*, draws(numbers, created_at)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

    // Fetch latest draw
    const { data: latestDraw } = await supabase
        .from("draws")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    const totalWinnings = (wins || []).reduce((sum, w) => {
        if (w.reward_tier === "jackpot") return sum + 10000;
        if (w.reward_tier === "mid") return sum + 500;
        if (w.reward_tier === "small") return sum + 50;
        return sum;
    }, 0);

    const charityName =
        profile?.charities && typeof profile.charities === "object"
            ? (profile.charities as { name: string }).name
            : null;

    return (
        <div className="p-6 md:p-8 space-y-6">
            {/* Welcome */}
            <div className="animate-fade-in-up">
                <h1 className="text-3xl font-bold">
                    Welcome back,{" "}
                    <span className="gradient-text">
                        {profile?.full_name || "Golfer"}
                    </span>
                    ! 👋
                </h1>
                <p className="text-muted mt-1">
                    Here&apos;s your golf performance overview
                </p>
            </div>

            {/* Stats row */}
            <div
                className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up"
                style={{ animationDelay: "0.05s" }}
            >
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <span className="text-xl">💳</span>
                        </div>
                        <p className="text-sm text-muted">Plan</p>
                    </div>
                    {profile?.subscription_status === "active" ? (
                        <p className="text-lg font-semibold text-success">Premium</p>
                    ) : (
                        <>
                            <p className="text-lg font-semibold text-accent">Free</p>
                            <Link
                                href="/dashboard/subscribe"
                                className="text-primary text-xs hover:underline mt-1 inline-block"
                            >
                                Upgrade →
                            </Link>
                        </>
                    )}
                </div>

                <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                            <span className="text-xl">🏌️</span>
                        </div>
                        <p className="text-sm text-muted">Scores</p>
                    </div>
                    <p className="text-lg font-semibold">{scores?.length || 0}/5</p>
                    <Link
                        href="/dashboard/scores"
                        className="text-primary text-xs hover:underline mt-1 inline-block"
                    >
                        Manage →
                    </Link>
                </div>

                <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                            <span className="text-xl">🏆</span>
                        </div>
                        <p className="text-sm text-muted">Winnings</p>
                    </div>
                    <p className="text-lg font-semibold gradient-text">
                        €{totalWinnings.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted mt-1">{wins?.length || 0} wins</p>
                </div>

                <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-danger/20 flex items-center justify-center">
                            <span className="text-xl">❤️</span>
                        </div>
                        <p className="text-sm text-muted">Charity</p>
                    </div>
                    <p className="text-lg font-semibold truncate">
                        {charityName || "None"}
                    </p>
                    {profile?.charity_percentage > 0 && (
                        <p className="text-xs text-muted mt-1">
                            {profile.charity_percentage}% contributed
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Your numbers */}
                <div
                    className="glass-card p-6 animate-fade-in-up"
                    style={{ animationDelay: "0.1s" }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <span>🎯</span> Your Numbers
                        </h2>
                        <Link
                            href="/dashboard/scores"
                            className="text-primary text-sm hover:underline"
                        >
                            Edit
                        </Link>
                    </div>
                    {scores && scores.length > 0 ? (
                        <>
                            <div className="flex flex-wrap gap-3 mb-4">
                                {scores.map((s) => (
                                    <div
                                        key={s.id}
                                        className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-primary/20"
                                    >
                                        {s.score}
                                    </div>
                                ))}
                                {Array.from({ length: 5 - scores.length }).map((_, i) => (
                                    <div
                                        key={`empty-${i}`}
                                        className="w-14 h-14 rounded-full border-2 border-dashed border-card-border flex items-center justify-center text-muted text-sm"
                                    >
                                        ?
                                    </div>
                                ))}
                            </div>
                            {scores.length < 5 && (
                                <p className="text-xs text-muted">
                                    Add {5 - scores.length} more score
                                    {5 - scores.length > 1 ? "s" : ""} to maximize your chances!
                                </p>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-muted text-sm mb-3">No scores entered yet</p>
                            <Link
                                href="/dashboard/scores"
                                className="btn-primary text-sm inline-block"
                            >
                                Enter First Score
                            </Link>
                        </div>
                    )}
                </div>

                {/* Latest draw */}
                <div
                    className="glass-card p-6 animate-fade-in-up"
                    style={{ animationDelay: "0.15s" }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <span>🎲</span> Latest Draw
                        </h2>
                        <Link
                            href="/dashboard/draws"
                            className="text-primary text-sm hover:underline"
                        >
                            All draws
                        </Link>
                    </div>
                    {latestDraw ? (
                        <>
                            <p className="text-xs text-muted mb-3">
                                {new Date(latestDraw.created_at).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </p>
                            <div className="flex flex-wrap gap-3">
                                {latestDraw.numbers.map((num: number, i: number) => {
                                    const isMatched = scores?.some((s) => s.score === num);
                                    return (
                                        <div
                                            key={i}
                                            className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg ${isMatched
                                                    ? "bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/20"
                                                    : "bg-white/10 text-muted"
                                                }`}
                                        >
                                            {num}
                                        </div>
                                    );
                                })}
                            </div>
                            {scores && scores.length > 0 && (
                                <p className="text-xs text-muted mt-3">
                                    💡 Matched numbers are highlighted in green
                                </p>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-muted text-sm">
                                No draws have been run yet. Stay tuned!
                            </p>
                        </div>
                    )}
                </div>

                {/* Recent wins */}
                <div
                    className="glass-card p-6 animate-fade-in-up"
                    style={{ animationDelay: "0.2s" }}
                >
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span>🏅</span> Recent Wins
                    </h2>
                    {wins && wins.length > 0 ? (
                        <div className="space-y-3">
                            {wins.map((win) => {
                                const prize =
                                    win.reward_tier === "jackpot"
                                        ? "€10,000"
                                        : win.reward_tier === "mid"
                                            ? "€500"
                                            : "€50";
                                const icon =
                                    win.reward_tier === "jackpot"
                                        ? "🏆"
                                        : win.reward_tier === "mid"
                                            ? "🥈"
                                            : "🥉";
                                return (
                                    <div
                                        key={win.id}
                                        className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{icon}</span>
                                            <div>
                                                <p className="font-medium capitalize text-sm">
                                                    {win.reward_tier} — {win.match_count} matches
                                                </p>
                                                <p className="text-xs text-muted">
                                                    Numbers: {win.matched_numbers.join(", ")}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="font-bold gradient-text">{prize}</span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-muted text-sm">
                                No wins yet — keep playing!
                            </p>
                        </div>
                    )}
                </div>

                {/* Quick actions */}
                <div
                    className="glass-card p-6 animate-fade-in-up"
                    style={{ animationDelay: "0.25s" }}
                >
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span>⚡</span> Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        <Link
                            href="/dashboard/scores"
                            className="p-4 rounded-xl bg-white/5 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all text-center group"
                        >
                            <span className="text-2xl group-hover:scale-110 inline-block transition-transform">
                                ⛳
                            </span>
                            <p className="text-sm font-medium mt-2">Enter Score</p>
                        </Link>
                        <Link
                            href="/dashboard/draws"
                            className="p-4 rounded-xl bg-white/5 hover:bg-secondary/10 border border-transparent hover:border-secondary/20 transition-all text-center group"
                        >
                            <span className="text-2xl group-hover:scale-110 inline-block transition-transform">
                                🎲
                            </span>
                            <p className="text-sm font-medium mt-2">View Draws</p>
                        </Link>
                        <Link
                            href="/dashboard/charity"
                            className="p-4 rounded-xl bg-white/5 hover:bg-danger/10 border border-transparent hover:border-danger/20 transition-all text-center group"
                        >
                            <span className="text-2xl group-hover:scale-110 inline-block transition-transform">
                                ❤️
                            </span>
                            <p className="text-sm font-medium mt-2">Charity</p>
                        </Link>
                        {profile?.is_admin ? (
                            <Link
                                href="/admin"
                                className="p-4 rounded-xl bg-white/5 hover:bg-accent/10 border border-transparent hover:border-accent/20 transition-all text-center group"
                            >
                                <span className="text-2xl group-hover:scale-110 inline-block transition-transform">
                                    🛠️
                                </span>
                                <p className="text-sm font-medium mt-2">Admin</p>
                            </Link>
                        ) : (
                            <Link
                                href="/dashboard/subscribe"
                                className="p-4 rounded-xl bg-white/5 hover:bg-accent/10 border border-transparent hover:border-accent/20 transition-all text-center group"
                            >
                                <span className="text-2xl group-hover:scale-110 inline-block transition-transform">
                                    💎
                                </span>
                                <p className="text-sm font-medium mt-2">Subscription</p>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
