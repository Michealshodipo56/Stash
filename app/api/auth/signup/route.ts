import { NextResponse } from "next/server";
import crypto from "crypto";
import { upsertUser, getUserByEmailOrPhone } from "@/lib/store";
import { hashPassword, createSession, SESSION_COOKIE_NAME, SESSION_DURATION_DAYS } from "@/lib/auth";
import { createBmoniUser } from "@/lib/bmoni";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, password } = body;

    if (!name || (!email && !phone) || !password) {
      return NextResponse.json(
        { error: "Name, password, and at least email or phone are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    if (email && getUserByEmailOrPhone(email)) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }
    if (phone && getUserByEmailOrPhone(phone)) {
      return NextResponse.json(
        { error: "An account with this phone number already exists" },
        { status: 409 }
      );
    }

    // Generate real user ID
    const userId = `u_${Date.now().toString(36)}_${crypto.randomBytes(3).toString("hex")}`;
    const passwordHash = hashPassword(password);

    // Immediately kick off BMONI onboarding: POST /v1/users to get real bmoniUserId
    let bmoniUserId: string | undefined;
    let bmoniError: string | undefined;
    let bmoniRawResponse: any = null;

    try {
      const bmoniResult = await createBmoniUser({ name, email, phone });
      bmoniUserId = bmoniResult.bmoniUserId;
      bmoniRawResponse = bmoniResult.raw;
    } catch (err: any) {
      // Surface real BMONI error — NEVER fall back to a fake ID
      bmoniError = err.message || "Failed to provision BMONI account";
      bmoniRawResponse = err.responseBody || null;
      console.warn("BMONI onboarding warning:", bmoniError);
    }

    // Persist real user row in database
    const user = upsertUser({
      id: userId,
      name,
      email: email || undefined,
      phone: phone || undefined,
      passwordHash,
      bmoniUserId, // real BMONI user ID if successful, undefined if failed (zero fake IDs)
      bmoniError,
      kycStatus: bmoniUserId ? "active" : "none",
      createdAt: new Date().toISOString(),
    });

    // Create session & HTTP-only signed session cookie
    const { cookieValue } = await createSession(user.id);

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

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      bmoniError,
      bmoniRawResponse,
    });

    response.cookies.set(SESSION_COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
