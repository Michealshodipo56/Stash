import { NextRequest, NextResponse } from "next/server";
import {
  getGoal,
  goalContributions,
  goalMembers,
  getUser,
  activeWithdrawal,
  votesFor,
  quorumFor,
  refundBreakdown,
} from "@/lib/store";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const goal = getGoal(id);

    if (!goal) {
      return NextResponse.json(
        { success: false, error: "Goal not found" },
        { status: 404 }
      );
    }

    const contributions = goalContributions(id);
    const totalContributed = contributions.reduce((sum, c) => sum + c.amount, 0);
    const members = goalMembers(id);
    const owner = getUser(goal.ownerId);
    const withdrawalReq = activeWithdrawal(id);
    const votes = withdrawalReq ? votesFor(withdrawalReq.id) : [];
    const quorum = goal.type === "group" ? quorumFor(id) : null;
    const refunds = goal.type === "group" ? refundBreakdown(id) : [];

    return NextResponse.json({
      success: true,
      goal: {
        ...goal,
        currentAmount: totalContributed,
        virtualAccount: {
          bankName: goal.virtualAccountBank || "Providus Bank",
          accountNumber: goal.virtualAccountNumber || "9928172641",
          accountName: `Aidex - ${goal.title}`,
        },
      },
      contributions,
      members,
      owner,
      withdrawalReq,
      votes,
      quorum,
      refunds,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch goal" },
      { status: 500 }
    );
  }
}
