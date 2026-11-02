"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import {
  MessageSquare,
  AlertTriangle,
  FileText,
  Bell,
  User as UserIcon,
  LogOut,
  Shield,
  Menu,
  X,
  MapPin,
  Globe,
  CheckCheck
} from "lucide-react";

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const Navbar: React.FC = () => {
  const { user, logout, updateUser } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const data = await apiFetch<NotificationItem[]>("/notifications");
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.is_read).length);
    } catch {
      // ignore in navbar
    }
  };

  const markAllRead = async () => {
    try {
      await apiFetch("/notifications/read-all", { method: "PUT" });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  const handleLanguageChange = async (lang: "en" | "hi" | "mr") => {
    if (user) {
      try {
        await apiFetch("/auth/me", {
          method: "PUT",
          body: JSON.stringify({ preferred_language: lang }),
        });
        updateUser({ preferred_language: lang });
      } catch {
        // ignore
      }
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#101614]/95 backdrop-blur-md border-b border-[#26352F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00C896] to-[#A3E635] flex items-center justify-center text-[#0A0D0C] font-bold shadow-lg shadow-[#00C896]/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-[#0A0D0C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-[#F3F7F5]">CivicConnect</span>
                <span className="bg-[#00C896]/20 text-[#00C896] text-xs font-semibold px-2 py-0.5 rounded border border-[#00C896]/30">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-[#9AAEA5] hidden sm:block">Ask. Report. Connect.</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/dashboard")
                      ? "bg-[#18231F] text-[#00C896] border border-[#26352F]"
                      : "text-[#9AAEA5] hover:text-[#F3F7F5] hover:bg-[#121A17]"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/chat"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/chat")
                      ? "bg-[#18231F] text-[#00C896] border border-[#26352F]"
                      : "text-[#9AAEA5] hover:text-[#F3F7F5] hover:bg-[#121A17]"
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-[#00C896]" />
                  AI Assistant
                </Link>
                <Link
                  href="/services"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/services")
                      ? "bg-[#18231F] text-[#00C896] border border-[#26352F]"
                      : "text-[#9AAEA5] hover:text-[#F3F7F5] hover:bg-[#121A17]"
                  }`}
                >
                  Services
                </Link>
                <Link
                  href="/complaints"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/complaints")
                      ? "bg-[#18231F] text-[#00C896] border border-[#26352F]"
                      : "text-[#9AAEA5] hover:text-[#F3F7F5] hover:bg-[#121A17]"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 text-[#F5B942]" />
                  Complaints
                </Link>
                <Link
                  href="/announcements"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/announcements")
                      ? "bg-[#18231F] text-[#00C896] border border-[#26352F]"
                      : "text-[#9AAEA5] hover:text-[#F3F7F5] hover:bg-[#121A17]"
                  }`}
                >
                  Announcements
                </Link>
                {user.role === "admin" && (
                  <Link
                    href="/admin/dashboard"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                      pathname.startsWith("/admin")
                        ? "bg-[#A3E635]/20 text-[#A3E635] border border-[#A3E635]/30"
                        : "text-[#A3E635] hover:bg-[#18231F]"
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Admin Portal
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/#features"
                  className="px-3 py-1.5 rounded-lg text-sm text-[#9AAEA5] hover:text-[#F3F7F5]"
                >
                  Features
                </Link>
                <Link
                  href="/services"
                  className="px-3 py-1.5 rounded-lg text-sm text-[#9AAEA5] hover:text-[#F3F7F5]"
                >
                  Public Services
                </Link>
                <Link
                  href="/announcements"
                  className="px-3 py-1.5 rounded-lg text-sm text-[#9AAEA5] hover:text-[#F3F7F5]"
                >
                  Notices
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative group">
              <div className="flex items-center gap-1 text-xs text-[#9AAEA5] bg-[#121A17] border border-[#26352F] px-2 py-1.5 rounded-lg cursor-pointer hover:border-[#00C896] transition-colors">
                <Globe className="w-3.5 h-3.5 text-[#00C896]" />
                <span className="uppercase font-semibold">{user?.preferred_language || "EN"}</span>
              </div>
              <div className="absolute right-0 mt-1 w-28 bg-[#121A17] border border-[#26352F] rounded-lg shadow-xl p-1 hidden group-hover:block z-50">
                <button
                  onClick={() => handleLanguageChange("en")}
                  className="w-full text-left px-2 py-1 text-xs rounded text-[#F3F7F5] hover:bg-[#18231F] hover:text-[#00C896]"
                >
                  English
                </button>
                <button
                  onClick={() => handleLanguageChange("hi")}
                  className="w-full text-left px-2 py-1 text-xs rounded text-[#F3F7F5] hover:bg-[#18231F] hover:text-[#00C896]"
                >
                  हिंदी (Hindi)
                </button>
                <button
                  onClick={() => handleLanguageChange("mr")}
                  className="w-full text-left px-2 py-1 text-xs rounded text-[#F3F7F5] hover:bg-[#18231F] hover:text-[#00C896]"
                >
                  मराठी (Marathi)
                </button>
              </div>
            </div>

            {user ? (
              <>
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative p-2 rounded-lg text-[#9AAEA5] hover:text-[#F3F7F5] hover:bg-[#18231F] transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#00C896] rounded-full ring-2 ring-[#101614] animate-pulse" />
                    )}
                  </button>

                  {/* Notification dropdown */}
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-[#121A17] border border-[#26352F] rounded-xl shadow-2xl p-3 z-50">
                      <div className="flex items-center justify-between pb-2 border-b border-[#26352F] mb-2">
                        <span className="text-xs font-semibold text-[#F3F7F5]">Notifications ({unreadCount} new)</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-[11px] text-[#00C896] hover:underline flex items-center gap-1"
                          >
                            <CheckCheck className="w-3 h-3" /> Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-[#9AAEA5] text-center py-4">No notifications yet.</p>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`p-2 rounded-lg text-xs border ${
                                n.is_read
                                  ? "bg-[#101614] border-[#26352F]/60 text-[#9AAEA5]"
                                  : "bg-[#18231F] border-[#00C896]/30 text-[#F3F7F5]"
                              }`}
                            >
                              <div className="font-semibold text-[#00C896]">{n.title}</div>
                              <p className="mt-0.5 leading-relaxed">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Pill & Logout */}
                <div className="flex items-center gap-2 pl-2 border-l border-[#26352F]">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#18231F] transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#00C896]/20 border border-[#00C896]/40 flex items-center justify-center text-xs font-bold text-[#00C896]">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-xs font-medium text-[#F3F7F5] hidden xl:block max-w-[100px] truncate">
                      {user.name}
                    </span>
                  </Link>
                  <button
                    onClick={logout}
                    title="Logout"
                    className="p-1.5 text-[#9AAEA5] hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#F3F7F5] hover:bg-[#18231F] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#00C896] hover:bg-[#00b284] text-[#0A0D0C] shadow-md shadow-[#00C896]/20 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#9AAEA5] hover:text-[#F3F7F5]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#101614] border-b border-[#26352F] px-4 pt-2 pb-4 space-y-2">
          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-[#F3F7F5] hover:bg-[#18231F]"
              >
                Dashboard
              </Link>
              <Link
                href="/chat"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-[#00C896] hover:bg-[#18231F]"
              >
                AI Assistant
              </Link>
              <Link
                href="/complaints"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-[#F3F7F5] hover:bg-[#18231F]"
              >
                My Complaints
              </Link>
              <Link
                href="/services"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-[#F3F7F5] hover:bg-[#18231F]"
              >
                Civic Services
              </Link>
              <Link
                href="/announcements"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-[#F3F7F5] hover:bg-[#18231F]"
              >
                Announcements
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-[#A3E635] hover:bg-[#18231F]"
                >
                  Admin Portal
                </Link>
              )}
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-[#F3F7F5] hover:bg-[#18231F]"
              >
                Profile Settings
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-950/30"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-[#F3F7F5] hover:bg-[#18231F]"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-[#00C896] hover:bg-[#18231F]"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};
