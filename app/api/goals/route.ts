import { NextResponse } from "next/server";
import {
  createGoal,
  listGoalsForUser,
  dashboardSummary,
  recentActivity,
  getStreak,
} from "@/lib/store";
import type { Frequency, GoalType } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "u_tolu";
    const goals = listGoalsForUser(userId);
    const summary = dashboardSummary(userId);
    const activity = recentActivity(userId, 8);
    const streak = getStreak();

    return NextResponse.json({
      success: true,
      goals,
      summary,
      activity,
      streak,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to fetch goals" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, type, targetAmount, deadline, frequency, emoji, ownerId } = body;

    if (!title || !targetAmount || !deadline || !frequency) {
      return NextResponse.json({ error: "Missing required goal parameters" }, { status: 400 });
    }

    const goal = await createGoal({
      title,
      type: (type as GoalType) ?? "individual",
      targetAmount: Number(targetAmount),
      deadline: String(deadline),
      frequency: frequency as Frequency,
      emoji: emoji ?? "🎯",
      ownerId: ownerId ?? "u_tolu",
    });

    return NextResponse.json({ success: true, goal });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to create goal" }, { status: 500 });
  }
}

