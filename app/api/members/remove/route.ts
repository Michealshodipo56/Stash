import { NextResponse } from "next/server";
import { removeMemberAndAdjust } from "@/lib/store";

export async function POST(req: Request) {
  try {
    const { goalId, memberUserId } = await req.json();
    if (!goalId || !memberUserId) {
      return NextResponse.json({ error: "Missing goalId or memberUserId" }, { status: 400 });
    }

    const result = await removeMemberAndAdjust(goalId, memberUserId);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to remove member" }, { status: 500 });
  }
}
