import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, phone, ninBvn, bankName, accountNumber } = body;

    if (!fullName || !ninBvn) {
      return NextResponse.json({ error: "Missing identity parameters" }, { status: 400 });
    }

    const bmoniUser = {
      bmoniUserId: `bm_user_${Math.random().toString(36).substring(2, 9)}`,
      smartWalletId: `sw_${Math.random().toString(36).substring(2, 9)}`,
      walletAddress: `0x${Math.random().toString(16).substring(2, 42)}`,
      kycStatus: "active",
    };

    return NextResponse.json({ success: true, user: bmoniUser });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Onboarding failed" }, { status: 500 });
  }
}
