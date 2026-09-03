import { NextResponse } from "next/server";
import { upsertUser, getUser, allUsers } from "@/lib/store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
      const user = getUser(id);
      return NextResponse.json({ success: true, user: user || null });
    }
    return NextResponse.json({ success: true, users: allUsers() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to fetch user" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, phoneOrEmail, phone, email, ninBvn, bankAccount, bmoniUserId, smartWalletId, walletAddress, isKycVerified } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }

    const user = upsertUser({
      id,
      name: name || "Aidex User",
      phone: phone || (phoneOrEmail && !phoneOrEmail.includes("@") ? phoneOrEmail : undefined),
      email: email || (phoneOrEmail && phoneOrEmail.includes("@") ? phoneOrEmail : undefined),
      bmoniUserId,
      smartWalletId,
      walletAddress,
      kycStatus: isKycVerified ? "active" : "none",
      bankAccountNumber: bankAccount?.accountNumber,
      bankName: bankAccount?.bankName,
      bankCode: "058",
    });

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to save user" }, { status: 500 });
  }
}
