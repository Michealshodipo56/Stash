import { NextResponse } from "next/server";
import {
  listGoalsForUser,
  goalContributions,
  payoutsForGoal,
  payoutsForUser,
  getGoal,
  getUser,
} from "@/lib/store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: true, transactions: [] });
    }

    const goals = listGoalsForUser(userId);
    const goalIds = new Set(goals.map((g) => g.id));
    const transactions: Array<{
      id: string;
      kind: "in" | "out";
      type: "contribution" | "completion_payout" | "emergency_refund";
      label: string;
      counterparty: string;
      goalId: string;
      goalTitle: string;
      goalEmoji: string;
      amount: number;
      reference?: string;
      status?: string;
      at: string;
    }> = [];

    for (const goal of goals) {
      for (const c of goalContributions(goal.id)) {
        // Show contributions on goals the user owns/is in, emphasizing their own when present
        transactions.push({
          id: c.id,
          kind: "in",
          type: "contribution",
          label: c.contributorUserId === userId ? "You deposited" : "Contribution received",
          counterparty: c.contributorName,
          goalId: goal.id,
          goalTitle: goal.title,
          goalEmoji: goal.emoji || "🎯",
          amount: c.amount,
          reference: c.bmoniReference,
          status: "completed",
          at: c.receivedAt,
        });
      }

      for (const p of payoutsForGoal(goal.id)) {
        if (!goalIds.has(p.goalId)) continue;
        const recipient = getUser(p.recipientUserId);
        transactions.push({
          id: p.id,
          kind: "out",
          type: p.type,
          label: p.type === "emergency_refund" ? "Refund sent" : "Goal payout",
          counterparty: recipient?.name || "Member",
          goalId: goal.id,
          goalTitle: goal.title,
          goalEmoji: goal.emoji || "🎯",
          amount: p.amount,
          reference: p.bmoniProposalId,
          status: p.bmoniStatus || "completed",
          at: p.createdAt,
        });
      }
    }

    // Include payouts received by the user on goals they may no longer be listed on
    for (const p of payoutsForUser(userId)) {
      if (transactions.some((t) => t.id === p.id)) continue;
      const goal = getGoal(p.goalId);
      transactions.push({
        id: p.id,
        kind: "out",
        type: p.type,
        label: p.type === "emergency_refund" ? "Refund received" : "Payout received",
        counterparty: "Your bank account",
        goalId: p.goalId,
        goalTitle: goal?.title || "Goal",
        goalEmoji: goal?.emoji || "🎯",
        amount: p.amount,
        reference: p.bmoniProposalId,
        status: p.bmoniStatus || "completed",
        at: p.createdAt,
      });
    }

    transactions.sort((a, b) => (a.at < b.at ? 1 : -1));

    const totalIn = transactions.filter((t) => t.kind === "in").reduce((s, t) => s + t.amount, 0);
    const totalOut = transactions.filter((t) => t.kind === "out").reduce((s, t) => s + t.amount, 0);

    return NextResponse.json({
      success: true,
      transactions,
      summary: { totalIn, totalOut, count: transactions.length },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}
