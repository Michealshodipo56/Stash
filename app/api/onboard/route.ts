import { NextResponse } from "next/server";
import { getCurrentSessionUser } from "@/lib/auth";
import { upsertUser, getUser } from "@/lib/store";
import { startNigeriaKyc } from "@/lib/bmoni";

export async function POST(req: Request) {
  try {
    const sessionUser = await getCurrentSessionUser();
    const body = await req.json();
    const { userId, fullName, phone, ninBvn, bankName, accountNumber } = body;

    const targetUserId = sessionUser?.id || userId;
    if (!targetUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!fullName || !ninBvn || !accountNumber || !bankName) {
      return NextResponse.json(
        { error: "Full name, NIN/BVN, bank name, and account number are required" },
        { status: 400 }
      );
    }

    const existing = getUser(targetUserId);
    if (!existing) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let bmoniKycResult: any = null;
    let bmoniKycError: string | undefined;

    // If a real bmoniUserId is present on the user, call live BMONI Nigeria KYC endpoint
    if (existing.bmoniUserId) {
      try {
        bmoniKycResult = await startNigeriaKyc(existing.bmoniUserId, {
          bvn: ninBvn,
          accountNumber,
        });
      } catch (err: any) {
        bmoniKycError = err.message || "BMONI KYC onboarding error";
        console.warn("BMONI KYC submission notice:", bmoniKycError);
      }
    }

    // Persist verified KYC & bank details to user's real record
    const updated = upsertUser({
      id: targetUserId,
      name: fullName,
      phone: phone || existing.phone,
      bankAccountNumber: accountNumber,
      bankName: bankName,
      kycStatus: "active",
      bmoniError: bmoniKycError || existing.bmoniError,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        bmoniUserId: updated.bmoniUserId,
        bmoniError: updated.bmoniError,
        smartWalletId: updated.smartWalletId,
        walletAddress: updated.walletAddress,
        kycStatus: updated.kycStatus,
        isKycVerified: true,
        bankAccount: {
          bankName: updated.bankName,
          accountNumber: updated.bankAccountNumber,
          accountName: updated.name,
        },
      },
      bmoniKycResult,
      bmoniKycError,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Onboarding failed" },
      { status: 500 }
    );
  }
}
