import { NextResponse } from "next/server";
import { getUserByEmailOrPhone } from "@/lib/store";
import { verifyPassword, createSession, SESSION_COOKIE_NAME, SESSION_DURATION_DAYS } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phoneOrEmail, password } = body;

    if (!phoneOrEmail || !password) {
      return NextResponse.json(
        { error: "Email or phone number and password are required" },
        { status: 400 }
      );
    }

    const user = getUserByEmailOrPhone(phoneOrEmail);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email/phone or password" },
        { status: 401 }
      );
    }

    // Check password if set, or allow demo access if user was created without password
    if (user.passwordHash) {
      const isValid = verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid email/phone or password" },
          { status: 401 }
        );
      }
    }

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
      { error: err.message || "Login failed" },
      { status: 500 }
    );
  }
}
