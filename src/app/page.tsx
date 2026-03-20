import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-card rounded-none border-x-0 border-t-0">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⛳</span>
            <span className="font-bold text-lg gradient-text">GolfCharity</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary text-sm py-2 px-4">
              Sign In
            </Link>
            <Link href="/signup" className="btn-primary text-sm py-2 px-4">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary/8 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 animate-fade-in-up">
            <span>🏆</span> Monthly Prize Draws — Win Big!
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Play Golf.{" "}
            <span className="gradient-text">Win Prizes.</span>
            <br />
            Give Back.
          </h1>

          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Track your golf scores, enter monthly prize draws, and contribute
            to charities you care about. All in one beautiful platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Link href="/signup" className="btn-primary text-lg px-8 py-3">
              Start Playing Free →
            </Link>
            <Link href="#features" className="btn-secondary text-lg px-8 py-3">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to{" "}
              <span className="gradient-text">play & give</span>
            </h2>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              A modern platform designed for golfers who want more than just a scorecard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "🏌️",
                title: "Score Tracking",
                description:
                  "Enter and track your latest golf scores. We keep your best 5 scores ready for each draw.",
                color: "primary",
              },
              {
                icon: "🎲",
                title: "Monthly Draws",
                description:
                  "Your scores become your lottery numbers. Match the draw and win amazing prizes!",
                color: "secondary",
              },
              {
                icon: "❤️",
                title: "Charity Giving",
                description:
                  "Choose a charity and set your contribution percentage. Make every round count.",
                color: "danger",
              },
              {
                icon: "🏆",
                title: "Reward Tiers",
                description:
                  "Match 3 for a small reward, 4 for mid-tier, and all 5 for the jackpot!",
                color: "accent",
              },
              {
                icon: "📊",
                title: "Dashboard",
                description:
                  "Beautiful dashboard to track your scores, draws, winnings, and charity contributions.",
                color: "success",
              },
              {
                icon: "💎",
                title: "Premium Access",
                description:
                  "Subscribe to unlock all features including draw participation and score tracking.",
                color: "primary",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="glass-card p-6 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-${feature.color}/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How it <span className="gradient-text">works</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Sign Up & Subscribe",
                description:
                  "Create your account and activate your subscription to unlock all features.",
              },
              {
                step: "02",
                title: "Enter Your Scores",
                description:
                  "Track your golf scores (1-45). Your latest 5 scores are used in draws.",
              },
              {
                step: "03",
                title: "Win & Give Back",
                description:
                  "Match draw numbers with your scores to win. A portion goes to your chosen charity.",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                  <span className="text-2xl font-bold gradient-text">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center glass-card p-10 animate-pulse-glow">
          <h2 className="text-3xl font-bold mb-4">Ready to tee off?</h2>
          <p className="text-muted mb-6">
            Join hundreds of golfers who are tracking scores, winning prizes,
            and supporting charities.
          </p>
          <Link href="/signup" className="btn-primary text-lg px-8 py-3 inline-block">
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-card-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⛳</span>
            <span className="font-bold gradient-text">GolfCharity</span>
          </div>
          <p className="text-sm text-muted">
            © 2026 GolfCharity. Play. Win. Give Back.
          </p>
        </div>
      </footer>
    </div>
  );
}
