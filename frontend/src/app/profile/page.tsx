"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { User, Mail, MapPin, Globe, Shield, Check, Save } from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [area, setArea] = useState(user?.area || "Shivaji Nagar");
  const [language, setLanguage] = useState(user?.preferred_language || "en");
  const [saved, setSaved] = useState(false);
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      const updated = await apiFetch<any>("/auth/me", {
        method: "PUT",
        body: JSON.stringify({
          name,
          area,
          preferred_language: language,
        }),
      });
      updateUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F3F7F5] flex items-center gap-2">
          <User className="w-6 h-6 text-[#00C896]" />
          <span>Citizen Profile & Preferences</span>
        </h1>
        <p className="text-xs text-[#9AAEA5]">
          Manage your account locality and language preferences for localized AI responses
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="p-6 rounded-3xl bg-[#121A17] border border-[#26352F] space-y-5 shadow-xl"
      >
        {saved && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-[#00C896]" />
            <span>Profile preferences updated successfully!</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#9AAEA5]">Full Name</label>
          <div className="relative flex items-center">
            <User className="w-4 h-4 text-[#9AAEA5] absolute left-3" />
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#101614] border border-[#26352F] text-xs text-[#F3F7F5] focus:outline-none focus:border-[#00C896]"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#9AAEA5]">Email Address (Permanent)</label>
          <div className="relative flex items-center">
            <Mail className="w-4 h-4 text-[#9AAEA5] absolute left-3" />
            <input
              type="email"
              disabled
              value={user?.email || ""}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#101614]/50 border border-[#26352F] text-xs text-[#9AAEA5] cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#9AAEA5]">Default Community Ward / Area</label>
            <div className="relative flex items-center">
              <MapPin className="w-4 h-4 text-[#00C896] absolute left-3" />
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
            <label className="text-xs font-semibold text-[#9AAEA5]">Preferred Language</label>
            <div className="relative flex items-center">
              <Globe className="w-4 h-4 text-[#00C896] absolute left-3" />
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

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#00C896] hover:bg-[#00b284] disabled:opacity-50 text-[#0A0D0C] font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-md shadow-[#00C896]/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Saving..." : "Save Preferences"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
