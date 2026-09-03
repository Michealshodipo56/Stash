import { NextResponse } from "next/server";
import { createWithdrawal, castVote, activeWithdrawal } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, goalId, requestedBy, reason, vote, voterId, requestId } = body;

    if (action === "propose") {
      if (!goalId || !requestedBy) {
        return NextResponse.json({ error: "Missing goalId or requestedBy" }, { status: 400 });
      }
      const existing = activeWithdrawal(goalId);
      if (existing) {
        return NextResponse.json({ error: "Active withdrawal request already exists for this goal" }, { status: 400 });
      }
      const request = createWithdrawal({
        goalId,
        requestedBy,
        reason: reason ?? "Emergency request",
      });
      return NextResponse.json({ success: true, request });
    }

    if (action === "vote") {
      if (!requestId || !voterId || vote === undefined) {
        return NextResponse.json({ error: "Missing requestId, voterId, or vote boolean" }, { status: 400 });
      }
      const result = await castVote({
        requestId,
        voterId,
        vote: Boolean(vote),
      });
      return NextResponse.json({ success: true, ...result });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Withdrawal processing failed" }, { status: 500 });
  }
}
