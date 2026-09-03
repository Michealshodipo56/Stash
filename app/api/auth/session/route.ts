import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return NextResponse.json({ user: null });
    }

    const user = await verifySession(sessionCookie.value);
    if (!user) {
      return NextResponse.json({ user: null });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      bmoniUserId: user.bmoniUserId,
      bmoniError: user.bmoniError,
      kycStatus: user.kycStatus,
      bankAccount: user.bankAccountNumber
        ? {
            bankName: user.bankName || "",
            accountNumber: user.bankAccountNumber,
            accountName: user.name,
          }
        : undefined,
      smartWalletId: user.smartWalletId,
      walletAddress: user.walletAddress,
      isKycVerified: user.kycStatus === "active",
      createdAt: user.createdAt,
    };

    return NextResponse.json({ user: safeUser });
  } catch (err: any) {
    return NextResponse.json({ user: null, error: err.message });
  }
}
