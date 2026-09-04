import { NextRequest, NextResponse } from "next/server";
import {
  getGoal,
  updateGoal,
  closeGoal,
  goalContributions,
  goalMembers,
  getUser,
  activeWithdrawal,
  votesFor,
  quorumFor,
  refundBreakdown,
} from "@/lib/store";
import { installmentFor } from "@/lib/calculator";

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
    const members = goalMembers(id).map((m) => {
      const u = getUser(m.userId);
      return {
        ...m,
        name: u?.name || "Member",
        avatarColor: u?.avatarColor || "#5FA618",
        contributed: contributions
          .filter((c) => c.contributorUserId === m.userId)
          .reduce((s, c) => s + c.amount, 0),
      };
    });
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

export async function PATCH(
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

    const body = await request.json();
    const updates: any = {};

    if (body.title !== undefined) updates.title = String(body.title).trim();
    if (body.targetAmount !== undefined) updates.targetAmount = Number(body.targetAmount);
    if (body.deadline !== undefined) updates.deadline = String(body.deadline);
    if (body.frequency !== undefined) updates.frequency = body.frequency;
    if (body.status !== undefined) updates.status = body.status;
    if (body.emoji !== undefined) updates.emoji = body.emoji;

    // Recalculate installment amount if targetAmount, deadline or frequency updated
    const finalTarget = updates.targetAmount !== undefined ? updates.targetAmount : goal.targetAmount;
    const finalDeadline = updates.deadline !== undefined ? updates.deadline : goal.deadline;
    const finalFrequency = updates.frequency !== undefined ? updates.frequency : goal.frequency;

    if (updates.targetAmount !== undefined || updates.deadline !== undefined || updates.frequency !== undefined) {
      updates.installmentAmount = installmentFor({
        target: finalTarget,
        deadline: finalDeadline,
        frequency: finalFrequency,
      });
    }

    const updatedGoal = updateGoal(id, updates);

    return NextResponse.json({
      success: true,
      goal: updatedGoal,
      message: "Goal updated successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update goal" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await closeGoal(id);

    return NextResponse.json({
      success: true,
      message: "Goal closed successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to close goal" },
      { status: 500 }
    );
  }
}
