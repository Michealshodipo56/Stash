"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserBankAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phoneOrEmail: string;
  isKycVerified: boolean;
  ninBvn?: string;
  bankAccount?: UserBankAccount;
  bmoniUserId?: string;
  smartWalletId?: string;
  walletAddress?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (phoneOrEmail: string, name?: string) => void;
  loginAsDemo: () => void;
  signup: (name: string, phoneOrEmail: string) => void;
  logout: () => void;
  updateKycAndBank: (data: {
    ninBvn: string;
    bankName: string;
    accountNumber: string;
    accountName?: string;
    bmoniUserId?: string;
    smartWalletId?: string;
    walletAddress?: string;
  }) => void;
}

const DEMO_USER: UserProfile = {
  id: "u_tolu",
  name: "Tolu Adeyemi",
  phoneOrEmail: "+234 801 234 5678",
  isKycVerified: true,
  ninBvn: "22334455667",
  bankAccount: {
    bankName: "Guaranty Trust Bank (GTBank)",
    accountNumber: "0123456789",
    accountName: "Tolu Adeyemi",
  },
  bmoniUserId: "bm_usr_tolu_01",
  smartWalletId: "sw_tolu_01",
  walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "aidex_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(DEMO_USER);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_USER));
      }
    } catch (e) {
      console.error("Failed to parse auth user:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  function saveUser(u: UserProfile | null) {
    setUser(u);
    if (u) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(u));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  function login(phoneOrEmail: string, name?: string) {
    const existing = user;
    const newUser: UserProfile = {
      id: existing?.id || `u_${Date.now().toString(36)}`,
      name: name || phoneOrEmail.split("@")[0] || "Aidex User",
      phoneOrEmail,
      isKycVerified: false,
    };
    saveUser(newUser);
  }

  function loginAsDemo() {
    saveUser(DEMO_USER);
  }

  function signup(name: string, phoneOrEmail: string) {
    const newUser: UserProfile = {
      id: `u_${Date.now().toString(36)}`,
      name,
      phoneOrEmail,
      isKycVerified: false,
    };
    saveUser(newUser);
  }

  function logout() {
    saveUser(null);
  }

  function updateKycAndBank(data: {
    ninBvn: string;
    bankName: string;
    accountNumber: string;
    accountName?: string;
    bmoniUserId?: string;
    smartWalletId?: string;
    walletAddress?: string;
  }) {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      isKycVerified: true,
      ninBvn: data.ninBvn,
      bankAccount: {
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        accountName: data.accountName || user.name,
      },
      bmoniUserId: data.bmoniUserId || `bm_usr_${Math.random().toString(36).substring(2, 9)}`,
      smartWalletId: data.smartWalletId || `sw_${Math.random().toString(36).substring(2, 9)}`,
      walletAddress: data.walletAddress || `0x${Math.random().toString(16).substring(2, 42)}`,
    };
    saveUser(updated);
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
