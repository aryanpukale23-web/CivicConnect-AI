"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { Users, Shield, User, MapPin, Globe, Check } from "lucide-react";

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  area: string;
  preferred_language: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login");
      return;
    }
    if (user && user.role === "admin") {
      apiFetch<UserItem[]>("/admin/users")
        .then((res) => setUsers(res))
        .catch((e) => console.error("Error loading users:", e))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  const toggleRole = async (userId: number, currentRole: string) => {
    const newRole = currentRole === "admin" ? "citizen" : "admin";
    if (!confirm(`Change this user's role to ${newRole.toUpperCase()}?`)) return;

    try {
      await apiFetch(`/admin/users/${userId}/role?role=${newRole}`, { method: "PUT" });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (e) {
      alert("Failed to update user role.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F7F5] flex items-center gap-2">
          <Users className="w-7 h-7 text-[#00C896]" />
          <span>User & Administrator Management</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#9AAEA5]">
          Manage registered citizen accounts and assign municipal administrative privileges
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-2">
          <div className="w-7 h-7 border-2 border-[#00C896] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#9AAEA5]">Loading user accounts...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="p-4 sm:p-5 rounded-2xl bg-[#121A17] border border-[#26352F] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    u.role === "admin"
                      ? "bg-[#A3E635]/20 text-[#A3E635] border border-[#A3E635]/40"
                      : "bg-[#00C896]/20 text-[#00C896] border border-[#00C896]/40"
                  }`}
                >
                  {u.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#F3F7F5]">{u.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        u.role === "admin"
                          ? "bg-[#A3E635]/15 text-[#A3E635] border-[#A3E635]/30"
                          : "bg-[#00C896]/15 text-[#00C896] border-[#00C896]/30"
                      }`}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#9AAEA5] mt-0.5">
                    <span>{u.email}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#00C896]" />
                      {u.area}
                    </span>
                    <span>•</span>
                    <span className="uppercase text-[11px] font-semibold">{u.preferred_language}</span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  onClick={() => toggleRole(u.id, u.role)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#18231F] hover:bg-[#26352F] border border-[#26352F] text-xs font-semibold text-[#F3F7F5] transition-colors"
                >
                  Make {u.role === "admin" ? "Citizen" : "Admin"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
