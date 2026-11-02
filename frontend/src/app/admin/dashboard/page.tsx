"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line
} from "recharts";
import {
  Shield,
  Users,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  FileText,
  ThumbsUp,
  Activity,
  ArrowRight,
  Sparkles
} from "lucide-react";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login");
      return;
    }

    if (user && user.role === "admin") {
      apiFetch<any>("/admin/analytics")
        .then((res) => setData(res))
        .catch((e) => console.error("Admin analytics fetch error:", e))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#A3E635] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#9AAEA5]">Loading municipal intelligence analytics...</p>
      </div>
    );
  }

  const COLORS = ["#00C896", "#A3E635", "#38bdf8", "#F5B942", "#f87171", "#c084fc"];

  const statusColors: Record<string, string> = {
    SUBMITTED: "#38bdf8",
    "UNDER REVIEW": "#F5B942",
    "IN PROGRESS": "#c084fc",
    RESOLVED: "#00C896"
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Admin Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#121A17] via-[#18231F] to-[#121A17] border border-[#26352F] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#A3E635]">
            <Shield className="w-4 h-4" />
            <span>MUNICIPAL ADMINISTRATION CONSOLE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F7F5]">
            Civic Operations & Analytics
          </h1>
          <p className="text-xs text-[#9AAEA5]">
            Real-time telemetry on citizen inquiries, grievance resolution, and AI response efficacy
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/complaints"
            className="px-3.5 py-2 rounded-xl bg-[#00C896] hover:bg-[#00b284] text-[#0A0D0C] font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-[#00C896]/20"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Manage Complaints</span>
          </Link>
          <Link
            href="/admin/documents"
            className="px-3.5 py-2 rounded-xl bg-[#18231F] hover:bg-[#26352F] border border-[#26352F] text-[#F3F7F5] font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-[#00C896]" />
            <span>Upload RAG Docs</span>
          </Link>
          <Link
            href="/admin/analytics"
            className="px-3.5 py-2 rounded-xl bg-[#18231F] hover:bg-[#26352F] border border-[#26352F] text-[#F3F7F5] font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-[#A3E635]" />
            <span>Query Audit Logs</span>
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-[#121A17] border border-[#26352F] space-y-1">
          <div className="text-xs text-[#9AAEA5] flex items-center justify-between">
            <span>Citizens Registered</span>
            <Users className="w-4 h-4 text-[#00C896]" />
          </div>
          <div className="text-2xl font-extrabold text-[#F3F7F5]">{data?.total_users || 0}</div>
          <div className="text-[11px] text-[#9AAEA5]">Verified community accounts</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#121A17] border border-[#26352F] space-y-1">
          <div className="text-xs text-[#9AAEA5] flex items-center justify-between">
            <span>Chatbot Queries</span>
            <MessageSquare className="w-4 h-4 text-[#A3E635]" />
          </div>
          <div className="text-2xl font-extrabold text-[#A3E635]">{data?.total_queries || 0}</div>
          <div className="text-[11px] text-[#9AAEA5]">Natural language questions</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#121A17] border border-[#26352F] space-y-1">
          <div className="text-xs text-[#9AAEA5] flex items-center justify-between">
            <span>Total Complaints</span>
            <AlertTriangle className="w-4 h-4 text-[#F5B942]" />
          </div>
          <div className="text-2xl font-extrabold text-[#F3F7F5]">{data?.total_complaints || 0}</div>
          <div className="text-[11px] text-[#9AAEA5]">Grievances logged</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#121A17] border border-[#26352F] space-y-1">
          <div className="text-xs text-[#9AAEA5] flex items-center justify-between">
            <span>Open Backlog</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-purple-400">{data?.open_complaints || 0}</div>
          <div className="text-[11px] text-[#9AAEA5]">Needs official action</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#121A17] border border-[#26352F] space-y-1">
          <div className="text-xs text-[#9AAEA5] flex items-center justify-between">
            <span>AI Feedback Score</span>
            <ThumbsUp className="w-4 h-4 text-[#00C896]" />
          </div>
          <div className="text-2xl font-extrabold text-[#00C896]">
            {data?.feedback_distribution?.helpful || 0} 👍
          </div>
          <div className="text-[11px] text-[#9AAEA5]">
            {data?.feedback_distribution?.unhelpful || 0} suggestions for improvement
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Queries by Category */}
        <div className="p-6 rounded-3xl bg-[#121A17] border border-[#26352F] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#F3F7F5] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#00C896]" />
              <span>Inquiries by Civic Category</span>
            </h3>
            <span className="text-[11px] text-[#9AAEA5]">Intent distribution</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.queries_by_category || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="category" stroke="#9AAEA5" fontSize={10} angle={-25} textAnchor="end" />
                <YAxis stroke="#9AAEA5" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#101614", borderColor: "#26352F", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="count" fill="#00C896" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Complaint Status Distribution */}
        <div className="p-6 rounded-3xl bg-[#121A17] border border-[#26352F] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#F3F7F5] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#F5B942]" />
              <span>Grievance Lifecycle Breakdown</span>
            </h3>
            <span className="text-[11px] text-[#9AAEA5]">Resolution Pipeline</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.complaint_status_distribution || []}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  label={(entry) => `${entry.status}: ${entry.count}`}
                >
                  {(data?.complaint_status_distribution || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={statusColors[entry.status] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#101614", borderColor: "#26352F", borderRadius: 8, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Weekly Telemetry Trend */}
        <div className="p-6 rounded-3xl bg-[#121A17] border border-[#26352F] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#F3F7F5] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#A3E635]" />
              <span>Weekly Inquiries & Grievances</span>
            </h3>
            <span className="text-[11px] text-[#9AAEA5]">Daily volume</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.daily_queries || []} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="day" stroke="#9AAEA5" fontSize={11} />
                <YAxis stroke="#9AAEA5" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#101614", borderColor: "#26352F", borderRadius: 8, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: "#9AAEA5" }} />
                <Line type="monotone" dataKey="queries" stroke="#00C896" strokeWidth={2} name="AI Queries" />
                <Line type="monotone" dataKey="complaints" stroke="#F5B942" strokeWidth={2} name="Complaints Filed" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Complaints by Category */}
        <div className="p-6 rounded-3xl bg-[#121A17] border border-[#26352F] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#F3F7F5] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-400" />
              <span>Reported Issues by Type</span>
            </h3>
            <span className="text-[11px] text-[#9AAEA5]">Potholes vs Light vs Waste</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.complaints_by_category || []} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="category" stroke="#9AAEA5" fontSize={10} angle={-20} textAnchor="end" />
                <YAxis stroke="#9AAEA5" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#101614", borderColor: "#26352F", borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="count" fill="#A3E635" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
