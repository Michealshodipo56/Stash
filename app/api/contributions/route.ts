import { NextResponse } from "next/server";
import { addContribution, getGoal } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { goalId, contributorName, contributorUserId, amount } = body;

    if (!goalId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid contribution data" }, { status: 400 });
    }

    const goal = getGoal(goalId);
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const contrib = await addContribution({
      goalId,
      contributorName: contributorName ?? "Anonymous Contributor",
      contributorUserId: contributorUserId ?? "u-tolu",
      amount: Number(amount),
    });

    return NextResponse.json({ success: true, contribution: contrib });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Contribution failed" }, { status: 500 });
  }
}
