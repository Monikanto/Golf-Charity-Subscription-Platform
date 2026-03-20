import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST - Run a new draw
export async function POST() {
    const supabase = await createClient();

    // Verify admin
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    if (!profile?.is_admin) {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Generate 5 unique random numbers between 1-45
    const numbers: number[] = [];
    while (numbers.length < 5) {
        const num = Math.floor(Math.random() * 45) + 1;
        if (!numbers.includes(num)) {
            numbers.push(num);
        }
    }
    numbers.sort((a, b) => a - b);

    // Insert draw
    const { data: draw, error: drawError } = await supabase
        .from("draws")
        .insert({ numbers, status: "completed" })
        .select()
        .single();

    if (drawError || !draw) {
        return NextResponse.json(
            { error: drawError?.message || "Failed to create draw" },
            { status: 500 }
        );
    }

    // Get all active subscribers with scores
    const { data: allScores } = await supabase
        .from("scores")
        .select("user_id, score");

    if (!allScores || allScores.length === 0) {
        return NextResponse.json({
            draw,
            winners: [],
            message: "Draw created but no scores found",
        });
    }

    // Group scores by user
    const userScoresMap: Record<string, number[]> = {};
    allScores.forEach((s) => {
        if (!userScoresMap[s.user_id]) {
            userScoresMap[s.user_id] = [];
        }
        userScoresMap[s.user_id].push(s.score);
    });

    // Match and determine winners
    const winnersToInsert: {
        user_id: string;
        draw_id: string;
        matched_numbers: number[];
        match_count: number;
        reward_tier: string;
    }[] = [];

    Object.entries(userScoresMap).forEach(([userId, scores]) => {
        const matched = scores.filter((s) => numbers.includes(s));
        const matchCount = matched.length;

        let rewardTier: string | null = null;
        if (matchCount >= 5) rewardTier = "jackpot";
        else if (matchCount === 4) rewardTier = "mid";
        else if (matchCount === 3) rewardTier = "small";

        if (rewardTier) {
            winnersToInsert.push({
                user_id: userId,
                draw_id: draw.id,
                matched_numbers: matched,
                match_count: matchCount,
                reward_tier: rewardTier,
            });
        }
    });

    // Insert winners
    if (winnersToInsert.length > 0) {
        await supabase.from("winners").insert(winnersToInsert);
    }

    return NextResponse.json({
        draw,
        winners: winnersToInsert,
        totalUsers: Object.keys(userScoresMap).length,
    });
}
