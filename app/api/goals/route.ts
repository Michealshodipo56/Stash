import { NextResponse } from "next/server";
import { getCurrentSessionUser } from "@/lib/auth";
import {
  createGoal,
  listActiveGoalsForUser,
  dashboardSummary,
  recentActivity,
  getStreak,
} from "@/lib/store";
import type { Frequency, GoalType } from "@/lib/types";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({
        success: true,
        goals: [],
        summary: {
          totalSaved: 0,
          goalCount: 0,
          thisMonth: 0,
          thisMonthDeltaPct: 0,
          groupContributions: 0,
          groupContributors: 0,
          payoutsReceived: 0,
        },
        activity: [],
        streak: { days: 0, week: [false, false, false, false, false, false, false] },
      });
    }

    const goals = listActiveGoalsForUser(userId);
    const summary = dashboardSummary(userId);
    const activity = recentActivity(userId, 8);
    const streak = getStreak(userId);

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
    const sessionUser = await getCurrentSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to create a goal." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, type, targetAmount, deadline, frequency, emoji } = body;

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
      ownerId: sessionUser.id,
      ownerName: sessionUser.name,
    });

    return NextResponse.json({ success: true, goal });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to create goal" }, { status: 500 });
  }
}
