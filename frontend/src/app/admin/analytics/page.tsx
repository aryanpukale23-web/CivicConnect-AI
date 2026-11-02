"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import {
  Activity,
  ThumbsUp,
  ThumbsDown,
  Clock,
  MessageSquare,
  Search,
  Sparkles
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"logs" | "feedback">("logs");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login");
      return;
    }
    if (user && user.role === "admin") {
      Promise.all([
        apiFetch<any[]>("/admin/query-logs"),
        apiFetch<any[]>("/admin/feedback")
      ])
        .then(([logsData, fbData]) => {
          setLogs(logsData);
          setFeedbacks(fbData);
        })
        .catch((e) => console.error("Error loading analytics audit:", e))
        .finally(() => setLoading(false));
    }
  }, [user, authLoading]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F7F5] flex items-center gap-2">
            <Activity className="w-7 h-7 text-[#00C896]" />
            <span>AI Query Audit & Feedback Intelligence</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#9AAEA5]">
            Real-time inspection of citizen questions, detected intents, response latencies, and satisfaction ratings
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#121A17] border border-[#26352F] w-fit">
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "logs"
                ? "bg-[#00C896] text-[#0A0D0C]"
                : "text-[#9AAEA5] hover:text-[#F3F7F5]"
            }`}
          >
            Query Logs ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab("feedback")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === "feedback"
                ? "bg-[#00C896] text-[#0A0D0C]"
                : "text-[#9AAEA5] hover:text-[#F3F7F5]"
            }`}
          >
            Citizen Feedback ({feedbacks.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-2">
          <div className="w-7 h-7 border-2 border-[#00C896] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#9AAEA5]">Loading audit data...</p>
        </div>
      ) : activeTab === "logs" ? (
        <div className="space-y-3">
          {logs.length === 0 ? (
            <p className="text-xs text-[#9AAEA5] text-center py-10">No queries logged yet.</p>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-[#121A17] border border-[#26352F] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#101614] text-[#00C896] border border-[#00C896]/30 uppercase">
                      {log.intent}
                    </span>
                    <span className="font-semibold text-[#F3F7F5]">"{log.query}"</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-[#9AAEA5]">
                  {log.response_time_ms && (
                    <span className="flex items-center gap-1 text-[#A3E635]">
                      <Clock className="w-3 h-3" /> {log.response_time_ms} ms
                    </span>
                  )}
                  <span>
                    {new Date(log.created_at).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {feedbacks.length === 0 ? (
            <p className="text-xs text-[#9AAEA5] text-center py-10">No citizen feedback submitted yet.</p>
          ) : (
            feedbacks.map((fb) => (
              <div
                key={fb.id}
                className="p-4 rounded-2xl bg-[#121A17] border border-[#26352F] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {fb.rating === 1 ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-bold text-[10px] flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" /> HELPFUL
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800 font-bold text-[10px] flex items-center gap-1">
                        <ThumbsDown className="w-3 h-3" /> NOT HELPFUL
                      </span>
                    )}
                    <span className="text-[#9AAEA5]">from {fb.user_name}</span>
                  </div>

                  <span className="text-[11px] text-[#9AAEA5]">
                    {new Date(fb.created_at).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric"
                    })}
                  </span>
                </div>

                <p className="text-[#9AAEA5] italic">AI Reply: "{fb.message_text}"</p>

                {fb.comment && (
                  <div className="p-2.5 rounded-xl bg-[#101614] border border-[#26352F] text-[#F3F7F5]">
                    <strong>Citizen Note:</strong> {fb.comment}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
