"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const baseNavItems = [
    { href: "/dashboard", label: "Overview", icon: "📊" },
    { href: "/dashboard/scores", label: "Scores", icon: "🏌️" },
    { href: "/dashboard/draws", label: "Draws", icon: "🎲" },
    { href: "/dashboard/charity", label: "Charity", icon: "❤️" },
    { href: "/dashboard/subscribe", label: "Subscription", icon: "💳" },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userName, setUserName] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("full_name, is_admin")
                    .eq("id", user.id)
                    .single();
                setUserName(profile?.full_name || user.email || "");
                setIsAdmin(profile?.is_admin || false);
            }
        };
        getUser();
    }, [supabase]);

    const navItems = isAdmin
        ? [...baseNavItems, { href: "/admin", label: "Admin Panel", icon: "🛠️" }]
        : baseNavItems;

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    return (
        <div className="min-h-screen gradient-bg flex">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 glass-card rounded-none border-l-0 border-t-0 border-b-0 p-5 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                    }`}
            >
                {/* Brand */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <span className="text-xl">⛳</span>
                    </div>
                    <div>
                        <h2 className="font-bold gradient-text">GolfCharity</h2>
                        <p className="text-xs text-muted">Dashboard</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                    ? "bg-primary/20 text-primary"
                                    : "text-muted hover:text-foreground hover:bg-white/5"
                                    }`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User section */}
                <div className="pt-4 border-t border-card-border">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm">
                            {userName.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{userName}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm text-muted hover:text-danger hover:bg-danger/10 transition-all"
                    >
                        ← Sign Out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-h-screen">
                {/* Top bar (mobile) */}
                <header className="md:hidden sticky top-0 z-30 glass-card rounded-none border-t-0 border-x-0 px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-lg">⛳</span>
                        <span className="font-bold gradient-text text-sm">GolfCharity</span>
                    </div>
                    <div className="w-10" /> {/* Spacer for centering */}
                </header>

                {children}
            </main>
        </div>
    );
}
