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

    // Fetch user profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    return (
        <div className="p-6 md:p-8 space-y-8 animate-fade-in-up">
            {/* Welcome header */}
            <div>
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

            {/* Status cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Subscription Status */}
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <span className="text-xl">💳</span>
                        </div>
                        <p className="text-sm text-muted">Subscription</p>
                    </div>
                    <p className="text-lg font-semibold capitalize">
                        {profile?.subscription_status === "active" ? (
                            <span className="text-success">Active</span>
                        ) : (
                            <span className="text-accent">Free Plan</span>
                        )}
                    </p>
                    {profile?.subscription_status !== "active" && (
                        <Link
                            href="/dashboard/subscribe"
                            className="text-primary text-sm hover:underline mt-1 inline-block"
                        >
                            Upgrade →
                        </Link>
                    )}
                </div>

                {/* Scores */}
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                            <span className="text-xl">🏌️</span>
                        </div>
                        <p className="text-sm text-muted">Your Scores</p>
                    </div>
                    <p className="text-lg font-semibold">–</p>
                    <Link
                        href="/dashboard/scores"
                        className="text-primary text-sm hover:underline mt-1 inline-block"
                    >
                        Enter scores →
                    </Link>
                </div>

                {/* Draws */}
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                            <span className="text-xl">🎲</span>
                        </div>
                        <p className="text-sm text-muted">Latest Draw</p>
                    </div>
                    <p className="text-lg font-semibold">–</p>
                    <Link
                        href="/dashboard/draws"
                        className="text-primary text-sm hover:underline mt-1 inline-block"
                    >
                        View draws →
                    </Link>
                </div>

                {/* Charity */}
                <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-danger/20 flex items-center justify-center">
                            <span className="text-xl">❤️</span>
                        </div>
                        <p className="text-sm text-muted">Charity</p>
                    </div>
                    <p className="text-lg font-semibold">
                        {profile?.charity_percentage
                            ? `${profile.charity_percentage}% donated`
                            : "Not selected"}
                    </p>
                    <Link
                        href="/dashboard/charity"
                        className="text-primary text-sm hover:underline mt-1 inline-block"
                    >
                        Choose charity →
                    </Link>
                </div>
            </div>

            {/* Quick actions */}
            <div className="glass-card p-6">
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-3">
                    <Link href="/dashboard/scores" className="btn-primary text-sm">
                        ⛳ Enter Score
                    </Link>
                    <Link href="/dashboard/draws" className="btn-secondary text-sm">
                        🎲 View Draws
                    </Link>
                    <Link href="/dashboard/charity" className="btn-secondary text-sm">
                        ❤️ Select Charity
                    </Link>
                    {profile?.subscription_status !== "active" && (
                        <Link
                            href="/dashboard/subscribe"
                            className="btn-secondary text-sm"
                        >
                            💎 Upgrade Plan
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
