"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface UserBankAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  phoneOrEmail?: string;
  isKycVerified: boolean;
  kycStatus?: "none" | "pending" | "active";
  ninBvn?: string;
  bankAccount?: UserBankAccount;
  bmoniUserId?: string;
  bmoniError?: string;
  smartWalletId?: string;
  walletAddress?: string;
}

export interface SignupInput {
  name: string;
  email?: string;
  phone?: string;
  password: string;
}

export interface LoginInput {
  phoneOrEmail: string;
  password: string;
}

export interface KycInput {
  fullName?: string;
  accountName?: string;
  ninBvn: string;
  bankName: string;
  accountNumber: string;
  phone?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (credentials: LoginInput) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: () => Promise<{ success: boolean; error?: string }>;
  signup: (
    input: SignupInput
  ) => Promise<{ success: boolean; error?: string; bmoniError?: string; user?: UserProfile }>;
  logout: () => Promise<void>;
  updateKycAndBank: (
    data: KycInput
  ) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session", {
        method: "GET",
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser({
            ...data.user,
            phoneOrEmail: data.user.email || data.user.phone || "",
            isKycVerified: data.user.kycStatus === "active" || Boolean(data.user.bankAccount),
          });
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error("Failed to check auth session:", e);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  async function login(credentials: LoginInput): Promise<{ success: boolean; error?: string }> {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || "Login failed" };
      }

      setUser({
        ...data.user,
        phoneOrEmail: data.user.email || data.user.phone || credentials.phoneOrEmail,
        isKycVerified: data.user.kycStatus === "active" || Boolean(data.user.bankAccount),
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error during login" };
    } finally {
      setIsLoading(false);
    }
  }

  async function signup(input: SignupInput): Promise<{
    success: boolean;
    error?: string;
    bmoniError?: string;
    user?: UserProfile;
  }> {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || "Signup failed",
          bmoniError: data.bmoniError,
        };
      }

      const safeUser: UserProfile = {
        ...data.user,
        phoneOrEmail: data.user.email || data.user.phone || "",
        isKycVerified: data.user.kycStatus === "active" || Boolean(data.user.bankAccount),
      };

      setUser(safeUser);
      return {
        success: true,
        user: safeUser,
        bmoniError: data.bmoniError,
      };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error during signup" };
    } finally {
      setIsLoading(false);
    }
  }

  async function loginAsDemo(): Promise<{ success: boolean; error?: string }> {
    // Attempt login with pre-seeded demo user
    return login({
      phoneOrEmail: "+2348012345678",
      password: "DemoPassword123!",
    }).then(async (result) => {
      if (!result.success) {
        // Fallback: create the demo user on the fly if not yet in store
        const signupRes = await signup({
          name: "Tolu Adeyemi",
          phone: "+2348012345678",
          email: "tolu@example.com",
          password: "DemoPassword123!",
        });
        if (signupRes.success && signupRes.user) {
          // Verify demo user bank
          await updateKycAndBank({
            fullName: "Tolu Adeyemi",
            ninBvn: "22334455667",
            bankName: "Guaranty Trust Bank (GTBank)",
            accountNumber: "0123456789",
          });
          return { success: true };
        }
      }
      return result;
    });
  }

  async function logout(): Promise<void> {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setUser(null);
  }

  async function updateKycAndBank(
    data: KycInput
  ): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
    try {
      setIsLoading(true);
      const res = await fetch("/api/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          ...data,
        }),
      });

      const responseData = await res.json();
      if (!res.ok || !responseData.success) {
        return { success: false, error: responseData.error || "KYC verification failed" };
      }

      const updatedUser: UserProfile = {
        ...responseData.user,
        phoneOrEmail: responseData.user.email || responseData.user.phone || user?.phoneOrEmail || "",
        isKycVerified: true,
      };

      setUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to submit KYC" };
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        loginAsDemo,
        signup,
        logout,
        updateKycAndBank,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
