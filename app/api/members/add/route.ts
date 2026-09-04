import { NextRequest, NextResponse } from "next/server";
import { addMemberToGoal } from "@/lib/store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { goalId, name, emailOrPhone } = body;

    if (!goalId || !name) {
      return NextResponse.json(
        { success: false, error: "goalId and name are required" },
        { status: 400 }
      );
    }

    const result = addMemberToGoal({
      goalId,
      name,
      emailOrPhone,
    });

    return NextResponse.json({
      success: true,
      member: result.member,
      user: result.user,
      message: "Member added successfully",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to add member" },
      { status: 500 }
    );
  }
}
