import { NextResponse } from "next/server";
import { createGoal } from "@/lib/store";
import type { Frequency, GoalType } from "@/lib/types";

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
      ownerId: ownerId ?? "u-tolu",
    });

    return NextResponse.json({ success: true, goal });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to create goal" }, { status: 500 });
  }
}
