"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { Shield, Lock, Mail, User, MapPin, Globe, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [area, setArea] = useState("Shivaji Nagar");
  const [language, setLanguage] = useState<"en" | "hi" | "mr">("en");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const areas = [
    "Shivaji Nagar",
    "Kothrud",
    "Hadapsar",
    "Viman Nagar",
    "Central Ward",
    "Aundh",
    "Baner",
    "Deccan",
    "Camp",
    "Kalyani Nagar"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const data = await apiFetch<{ access_token: string; user: any }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          confirm_password: confirmPassword,
          area,
          preferred_language: language,
        }),
      });
      login(data.access_token, data.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00C896] to-[#A3E635] flex items-center justify-center text-[#0A0D0C] font-bold mx-auto shadow-lg shadow-[#00C896]/20">
          <Shield className="w-6 h-6 text-[#0A0D0C]" />
        </div>
        <h1 className="text-2xl font-bold text-[#F3F7F5]">Citizen Registration</h1>
        <p className="text-xs text-[#9AAEA5]">Create your account for personalized community assistance</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[#121A17] border border-[#26352F] space-y-4 shadow-xl">
        {error && (
          <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs leading-relaxed">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#9AAEA5]">Full Name</label>
          <div className="relative flex items-center">
            <User className="w-4 h-4 text-[#9AAEA5] absolute left-3" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pooja Sharma"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#101614] border border-[#26352F] text-sm text-[#F3F7F5] placeholder-[#9AAEA5]/50 focus:outline-none focus:border-[#00C896]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#9AAEA5]">Email Address</label>
          <div className="relative flex items-center">
            <Mail className="w-4 h-4 text-[#9AAEA5] absolute left-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pooja@example.com"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#101614] border border-[#26352F] text-sm text-[#F3F7F5] placeholder-[#9AAEA5]/50 focus:outline-none focus:border-[#00C896]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#9AAEA5]">Select Area</label>
            <div className="relative flex items-center">
              <MapPin className="w-4 h-4 text-[#9AAEA5] absolute left-3" />
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#101614] border border-[#26352F] text-xs text-[#F3F7F5] focus:outline-none focus:border-[#00C896]"
              >
                {areas.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#9AAEA5]">Preferred Language</label>
            <div className="relative flex items-center">
              <Globe className="w-4 h-4 text-[#9AAEA5] absolute left-3" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#101614] border border-[#26352F] text-xs text-[#F3F7F5] focus:outline-none focus:border-[#00C896]"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>
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
              placeholder="Min 6 characters"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#101614] border border-[#26352F] text-sm text-[#F3F7F5] placeholder-[#9AAEA5]/50 focus:outline-none focus:border-[#00C896]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#9AAEA5]">Confirm Password</label>
          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-[#9AAEA5] absolute left-3" />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
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
            <span>Creating account...</span>
          ) : (
            <>
              <span>Create Citizen Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="text-center pt-2 text-xs text-[#9AAEA5]">
          Already registered?{" "}
          <Link href="/login" className="text-[#00C896] hover:underline font-medium">
            Sign In here
          </Link>
        </div>
      </form>
    </div>
  );
}
