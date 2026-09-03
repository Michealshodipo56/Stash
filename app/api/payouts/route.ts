import { NextResponse } from "next/server";
import { payoutsForUser, getGoal, getUser, listGoalsForUser, payoutsForGoal } from "@/lib/store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: true, payouts: [] });
    }

    // Payouts received by the user directly, plus payouts on goals owned by the user
    const userGoals = listGoalsForUser(userId);
    const userGoalIds = new Set(userGoals.map((g) => g.id));
    const allPayouts = payoutsForUser(userId);

    for (const goal of userGoals) {
      const goalPayouts = payoutsForGoal(goal.id);
      for (const gp of goalPayouts) {
        if (!allPayouts.some((p) => p.id === gp.id)) {
          allPayouts.push(gp);
        }
      }
    }

    const enriched = allPayouts.map((p) => {
      const goal = getGoal(p.goalId);
      const recipient = getUser(p.recipientUserId);
      return {
        ...p,
        goalTitle: goal?.title || "Savings Goal",
        recipientName: recipient?.name || "Member",
        bankName: recipient?.bankName || "GTBank",
        bankAccountNumber: recipient?.bankAccountNumber || "0123456789",
      };
    });

    return NextResponse.json({ success: true, payouts: enriched });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to fetch payouts" }, { status: 500 });
  }
}
