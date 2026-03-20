"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Charity {
    id: string;
    name: string;
    description: string;
    image_url: string;
}

const charityEmojis: Record<string, string> = {
    "Golf for Good": "🏌️",
    "Green Earth Foundation": "🌍",
    "Swing for Hope": "💪",
    "Fairway Dreams": "⭐",
    "The First Tee": "🫶",
};

export default function CharityPage() {
    const [charities, setCharities] = useState<Charity[]>([]);
    const [selectedCharityId, setSelectedCharityId] = useState<string | null>(
        null
    );
    const [percentage, setPercentage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const supabase = createClient();

    const fetchData = useCallback(async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch charities
        const { data: charitiesData } = await supabase
            .from("charities")
            .select("*")
            .order("name");
        if (charitiesData) setCharities(charitiesData);

        // Fetch user's current selection
        const { data: profile } = await supabase
            .from("profiles")
            .select("charity_id, charity_percentage")
            .eq("id", user.id)
            .single();

        if (profile) {
            setSelectedCharityId(profile.charity_id);
            setPercentage(profile.charity_percentage || 10);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async () => {
        setSaving(true);
        setSuccess(false);
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from("profiles")
                .update({
                    charity_id: selectedCharityId,
                    charity_percentage: percentage,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", user.id);

            if (!error) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 md:p-8">
                <div className="text-center py-20 text-muted">Loading charities...</div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 animate-fade-in-up">
                    <h1 className="text-3xl font-bold">
                        <span className="gradient-text">Choose a Charity</span>
                    </h1>
                    <p className="text-muted mt-1">
                        Select a charity and set your contribution percentage from
                        winnings.
                    </p>
                </div>

                {/* Charity grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {charities.map((charity, i) => (
                        <button
                            key={charity.id}
                            onClick={() => setSelectedCharityId(charity.id)}
                            className={`glass-card p-5 text-left transition-all duration-300 hover:-translate-y-1 animate-fade-in-up ${selectedCharityId === charity.id
                                    ? "border-primary/50 bg-primary/5"
                                    : "hover:border-primary/20"
                                }`}
                            style={{ animationDelay: `${i * 0.05}s` }}
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-2xl flex-shrink-0">
                                    {charityEmojis[charity.name] || "❤️"}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold">{charity.name}</h3>
                                        {selectedCharityId === charity.id && (
                                            <span className="text-primary text-sm">✓</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted mt-1 leading-relaxed">
                                        {charity.description}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Contribution slider */}
                <div
                    className="glass-card p-6 mb-6 animate-fade-in-up"
                    style={{ animationDelay: "0.25s" }}
                >
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span>📊</span> Contribution Percentage
                    </h2>
                    <p className="text-sm text-muted mb-4">
                        Set the percentage of your winnings that will go to your selected
                        charity.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min={0}
                                max={100}
                                step={5}
                                value={percentage}
                                onChange={(e) => setPercentage(parseInt(e.target.value))}
                                className="flex-1 h-2 rounded-full appearance-none cursor-pointer accent-primary"
                                style={{
                                    background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${percentage}%, rgba(255,255,255,0.1) ${percentage}%, rgba(255,255,255,0.1) 100%)`,
                                }}
                            />
                            <div className="w-16 text-center">
                                <span className="text-2xl font-bold gradient-text">
                                    {percentage}%
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between text-xs text-muted">
                            <span>0%</span>
                            <span>25%</span>
                            <span>50%</span>
                            <span>75%</span>
                            <span>100%</span>
                        </div>
                    </div>
                </div>

                {/* Save button */}
                <div
                    className="flex items-center gap-4 animate-fade-in-up"
                    style={{ animationDelay: "0.3s" }}
                >
                    <button
                        onClick={handleSave}
                        disabled={saving || !selectedCharityId}
                        className="btn-primary"
                    >
                        {saving ? "Saving..." : "Save Preferences"}
                    </button>

                    {success && (
                        <p className="text-success text-sm animate-fade-in">
                            ✓ Preferences saved successfully!
                        </p>
                    )}

                    {!selectedCharityId && (
                        <p className="text-muted text-sm">
                            Please select a charity first
                        </p>
                    )}
                </div>

                {/* Summary */}
                {selectedCharityId && (
                    <div
                        className="glass-card p-5 mt-6 animate-fade-in-up"
                        style={{ animationDelay: "0.35s" }}
                    >
                        <h3 className="font-semibold mb-2">📋 Your Contribution Summary</h3>
                        <p className="text-sm text-muted">
                            <strong className="text-foreground">{percentage}%</strong> of
                            your winnings will be donated to{" "}
                            <strong className="text-primary">
                                {charities.find((c) => c.id === selectedCharityId)?.name}
                            </strong>
                            .
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
