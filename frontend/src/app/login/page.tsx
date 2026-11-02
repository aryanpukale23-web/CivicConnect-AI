"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { Shield, Lock, Mail, ArrowRight, UserCheck, ShieldAlert, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await apiFetch<{ access_token: string; user: any }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      login(data.access_token, data.user);
      if (data.user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCitizen = () => {
    setEmail("citizen@civicconnect.org");
    setPassword("Citizen@123");
    setError(null);
  };

  const fillDemoAdmin = () => {
    setEmail("admin@civicconnect.org");
    setPassword("Admin@123");
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00C896] to-[#A3E635] flex items-center justify-center text-[#0A0D0C] font-bold mx-auto shadow-lg shadow-[#00C896]/20">
          <Shield className="w-6 h-6 text-[#0A0D0C]" />
        </div>
        <h1 className="text-2xl font-bold text-[#F3F7F5]">Welcome to CivicConnect AI</h1>
        <p className="text-xs text-[#9AAEA5]">Sign in to access your civic assistant & complaint tracking</p>
      </div>

      {/* Demo Credentials Quick Fill Banner */}
      <div className="p-4 rounded-2xl bg-[#121A17] border border-[#26352F] space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#00C896]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick Demo Access (1-Click Fill)</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={fillDemoCitizen}
            className="px-3 py-2 rounded-xl bg-[#18231F] hover:bg-[#26352F] border border-[#26352F] text-xs font-medium text-[#F3F7F5] flex items-center justify-center gap-1.5 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#00C896]" />
            <span>Citizen Demo</span>
          </button>
          <button
            type="button"
            onClick={fillDemoAdmin}
            className="px-3 py-2 rounded-xl bg-[#18231F] hover:bg-[#26352F] border border-[#26352F] text-xs font-medium text-[#A3E635] flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#A3E635]" />
            <span>Admin Demo</span>
          </button>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#121A17] border border-[#26352F] space-y-4 shadow-xl">
        {error && (
          <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs leading-relaxed">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#9AAEA5]">Email Address</label>
          <div className="relative flex items-center">
            <Mail className="w-4 h-4 text-[#9AAEA5] absolute left-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@civicconnect.org"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#101614] border border-[#26352F] text-sm text-[#F3F7F5] placeholder-[#9AAEA5]/50 focus:outline-none focus:border-[#00C896]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#9AAEA5]">Password</label>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-[#9AAEA5] absolute left-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#101614] border border-[#26352F] text-sm text-[#F3F7F5] placeholder-[#9AAEA5]/50 focus:outline-none focus:border-[#00C896]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#00C896] hover:bg-[#00b284] disabled:opacity-50 text-[#0A0D0C] font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-md shadow-[#00C896]/20 transition-all"
        >
          {loading ? (
            <span>Signing in...</span>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="text-center pt-2 text-xs text-[#9AAEA5]">
          Don't have an account?{" "}
          <Link href="/register" className="text-[#00C896] hover:underline font-medium">
            Register as a Citizen
          </Link>
        </div>
      </form>
    </div>
  );
}
