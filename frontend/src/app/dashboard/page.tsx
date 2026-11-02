"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import {
  MessageSquare,
  AlertTriangle,
  FileText,
  Search,
  Bell,
  Clock,
  MapPin,
  ArrowRight,
  Sparkles,
  CheckCircle,
  HelpCircle,
  FolderOpen
} from "lucide-react";

interface ComplaintItem {
  id: number;
  category: string;
  title: string;
  location: string;
  priority: string;
  status: string;
  created_at: string;
}

interface AnnouncementItem {
  id: number;
  title: string;
  description: string;
  area: string;
  priority: string;
  created_at: string;
}

interface ConversationItem {
  id: number;
  title: string;
  updated_at: string;
  messages_count: number;
}

export default function UserDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      Promise.all([
        apiFetch<ComplaintItem[]>("/complaints"),
        apiFetch<AnnouncementItem[]>(`/announcements?area=${encodeURIComponent(user.area || "All Areas")}`),
        apiFetch<ConversationItem[]>("/chat/conversations")
      ])
        .then(([comps, anns, convs]) => {
          setComplaints(comps);
          setAnnouncements(anns.slice(0, 3));
          setConversations(convs.slice(0, 4));
        })
        .catch((e) => console.error("Dashboard data load error:", e))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#00C896] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#9AAEA5]">Loading your civic dashboard...</p>
      </div>
    );
  }

  const openComplaintsCount = complaints.filter((c) => c.status !== "RESOLVED").length;
  const resolvedComplaintsCount = complaints.filter((c) => c.status === "RESOLVED").length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#121A17] via-[#18231F] to-[#121A17] border border-[#26352F] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#00C896]">
            <Sparkles className="w-4 h-4" />
            <span>COMMUNITY MEMBER PORTAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F7F5]">
            Welcome back, {user?.name}!
          </h1>
          <div className="flex items-center gap-2 text-xs text-[#9AAEA5]">
            <MapPin className="w-3.5 h-3.5 text-[#00C896]" />
            <span>Assigned Ward: <strong className="text-[#F3F7F5]">{user?.area}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/chat"
            className="px-4 py-2.5 rounded-xl bg-[#00C896] hover:bg-[#00b284] text-[#0A0D0C] font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-[#00C896]/20 transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ask AI Assistant</span>
          </Link>
          <Link
            href="/complaints/new"
            className="px-4 py-2.5 rounded-xl bg-[#18231F] hover:bg-[#26352F] border border-[#26352F] text-[#F3F7F5] font-semibold text-xs flex items-center gap-1.5 transition-all"
          >
            <AlertTriangle className="w-4 h-4 text-[#F5B942]" />
            <span>Report Problem</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#121A17] border border-[#26352F] space-y-1">
          <div className="text-xs text-[#9AAEA5] flex items-center justify-between">
            <span>Conversations</span>
            <MessageSquare className="w-4 h-4 text-[#00C896]" />
          </div>
          <div className="text-2xl font-bold text-[#F3F7F5]">{conversations.length}</div>
          <div className="text-[11px] text-[#9AAEA5]">AI queries asked</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#121A17] border border-[#26352F] space-y-1">
          <div className="text-xs text-[#9AAEA5] flex items-center justify-between">
            <span>Total Complaints</span>
            <AlertTriangle className="w-4 h-4 text-[#F5B942]" />
          </div>
          <div className="text-2xl font-bold text-[#F3F7F5]">{complaints.length}</div>
          <div className="text-[11px] text-[#9AAEA5]">Filed in your name</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#121A17] border border-[#26352F] space-y-1">
          <div className="text-xs text-[#9AAEA5] flex items-center justify-between">
            <span>Open Grievances</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">{openComplaintsCount}</div>
          <div className="text-[11px] text-[#9AAEA5]">Under active resolution</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#121A17] border border-[#26352F] space-y-1">
          <div className="text-xs text-[#9AAEA5] flex items-center justify-between">
            <span>Resolved Issues</span>
            <CheckCircle className="w-4 h-4 text-[#00C896]" />
          </div>
          <div className="text-2xl font-bold text-[#00C896]">{resolvedComplaintsCount}</div>
          <div className="text-[11px] text-[#9AAEA5]">Successfully closed</div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[#9AAEA5] uppercase tracking-wider">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Ask AI", href: "/chat", icon: MessageSquare, color: "#00C896" },
            { label: "Report Issue", href: "/complaints/new", icon: AlertTriangle, color: "#F5B942" },
            { label: "View Services", href: "/services", icon: Search, color: "#38bdf8" },
            { label: "Notices", href: "/announcements", icon: Bell, color: "#A3E635" },
            { label: "My Complaints", href: "/complaints", icon: FolderOpen, color: "#c084fc" },
            { label: "Chat History", href: "/history", icon: Clock, color: "#9AAEA5" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <Link
                key={i}
                href={item.href}
                className="p-4 rounded-2xl bg-[#121A17] border border-[#26352F] hover:border-[#00C896] hover:bg-[#18231F] transition-all flex flex-col items-center justify-center text-center gap-2 group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${item.color}15`, color: item.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-[#F3F7F5]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Recent Complaints & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Complaints */}
        <div className="p-6 rounded-3xl bg-[#121A17] border border-[#26352F] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#F3F7F5] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#F5B942]" />
              <span>Recent Grievance Reports</span>
            </h3>
            <Link href="/complaints" className="text-xs text-[#00C896] hover:underline flex items-center gap-1">
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {complaints.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#9AAEA5] space-y-2">
                <p>You haven't submitted any civic complaints yet.</p>
                <Link
                  href="/complaints/new"
                  className="inline-block text-[#00C896] hover:underline font-semibold"
                >
                  Report a pothole, garbage, or street light issue
                </Link>
              </div>
            ) : (
              complaints.slice(0, 3).map((comp) => (
                <div
                  key={comp.id}
                  className="p-3.5 rounded-xl bg-[#101614] border border-[#26352F] space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#F3F7F5] truncate max-w-[200px]">
                      #{comp.id} {comp.title}
                    </span>
                    <StatusBadge status={comp.status} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#9AAEA5]">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#00C896]" />
                      {comp.location}
                    </span>
                    <StatusBadge status={comp.priority} type="priority" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Notices */}
        <div className="p-6 rounded-3xl bg-[#121A17] border border-[#26352F] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#F3F7F5] flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#A3E635]" />
              <span>Community Notices for {user?.area}</span>
            </h3>
            <Link href="/announcements" className="text-xs text-[#00C896] hover:underline flex items-center gap-1">
              <span>All notices</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {announcements.length === 0 ? (
              <p className="text-xs text-[#9AAEA5] text-center py-8">
                No active municipal alerts for your area today.
              </p>
            ) : (
              announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-3.5 rounded-xl bg-[#101614] border border-[#26352F] space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-[#F3F7F5] truncate">{ann.title}</h4>
                    <StatusBadge status={ann.priority} type="priority" />
                  </div>
                  <p className="text-xs text-[#9AAEA5] line-clamp-2 leading-relaxed">
                    {ann.description}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
