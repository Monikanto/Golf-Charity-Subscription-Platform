export const dynamic = "force-dynamic";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
            {/* Background decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float" />
                <div
                    className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float"
                    style={{ animationDelay: "3s" }}
                />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo / Brand */}
                <div className="text-center mb-8 animate-fade-in-up">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-4 animate-pulse-glow">
                        <span className="text-3xl">⛳</span>
                    </div>
                    <h1 className="text-2xl font-bold gradient-text">GolfCharity</h1>
                    <p className="text-muted text-sm mt-1">Play. Win. Give Back.</p>
                </div>

                {/* Auth card */}
                <div
                    className="glass-card p-8 animate-fade-in-up"
                    style={{ animationDelay: "0.1s" }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}
