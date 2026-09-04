import { NextResponse } from "next/server";
import { getCurrentSessionUser } from "@/lib/auth";
import { addContribution, getGoal, goalContributions, listGoalsForUser, getUser } from "@/lib/store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const goalId = searchParams.get("goalId");

    if (goalId) {
      const contributions = goalContributions(goalId);
      return NextResponse.json({ success: true, contributions });
    }

    if (userId) {
      const userGoals = listGoalsForUser(userId);
      const goalMap = new Map(userGoals.map((g) => [g.id, g]));
      const allContribs: any[] = [];

      for (const g of userGoals) {
        const cList = goalContributions(g.id);
        for (const c of cList) {
          allContribs.push({
            ...c,
            goalTitle: g.title,
            goalEmoji: g.emoji || "🎯",
          });
        }
      }

      allContribs.sort((a, b) => (a.receivedAt < b.receivedAt ? 1 : -1));
      return NextResponse.json({ success: true, contributions: allContribs, goals: userGoals });
    }

    return NextResponse.json({ success: true, contributions: [], goals: [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to fetch contributions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sessionUser = await getCurrentSessionUser();
    const body = await req.json();
    const { goalId, contributorName, contributorUserId, amount } = body;

    if (!goalId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid contribution data" }, { status: 400 });
    }

    const goal = getGoal(goalId);
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const effectiveUserId = contributorUserId || sessionUser?.id || undefined;
    const effectiveName = contributorName || sessionUser?.name || "Anonymous Contributor";

    if (goal.type === "group" && !effectiveUserId) {
      return NextResponse.json(
        { error: "This is a group goal. Only invited members can contribute." },
        { status: 403 }
      );
    }

    const contrib = await addContribution({
      goalId,
      contributorName: effectiveName,
      contributorUserId: effectiveUserId,
      amount: Number(amount),
    });

    return NextResponse.json({ success: true, contribution: contrib });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Contribution failed" }, { status: 500 });
  }
}
