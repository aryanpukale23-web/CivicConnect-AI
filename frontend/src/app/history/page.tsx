"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import {
  Clock,
  Search,
  MessageSquare,
  Trash2,
  ArrowRight,
  Sparkles,
  Calendar
} from "lucide-react";

interface ConversationItem {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  messages_count: number;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await apiFetch<ConversationItem[]>("/chat/conversations");
      setConversations(data);
    } catch (e) {
      console.error("Failed to load chat history:", e);
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (id: number) => {
    if (!confirm("Are you sure you want to delete this conversation?")) return;
    try {
      await apiFetch(`/chat/conversations/${id}`, { method: "DELETE" });
      setConversations((prev) => prev.filter((c) => c.id !== id));
    } catch (e) {
      alert("Failed to delete conversation.");
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F3F7F5] flex items-center gap-2">
            <Clock className="w-6 h-6 text-[#00C896]" />
            <span>Chat History</span>
          </h1>
          <p className="text-xs text-[#9AAEA5]">
            Review your previous civic inquiries and continue past conversations
          </p>
        </div>

        <Link
          href="/chat"
          className="px-4 py-2.5 rounded-xl bg-[#00C896] hover:bg-[#00b284] text-[#0A0D0C] font-semibold text-xs flex items-center gap-2 shadow-md shadow-[#00C896]/20 transition-all w-fit"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Start New Query</span>
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#9AAEA5] absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search past conversations by keyword..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#121A17] border border-[#26352F] text-xs text-[#F3F7F5] placeholder-[#9AAEA5]/50 focus:outline-none focus:border-[#00C896]"
        />
      </div>

      {/* Conversations List */}
      {loading ? (
        <div className="py-20 text-center space-y-2">
          <div className="w-7 h-7 border-2 border-[#00C896] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#9AAEA5]">Loading past sessions...</p>
        </div>
      ) : filteredConversations.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#121A17] border border-[#26352F] text-center space-y-3">
          <MessageSquare className="w-8 h-8 text-[#9AAEA5] mx-auto opacity-50" />
          <p className="text-sm font-semibold text-[#F3F7F5]">No conversations found</p>
          <p className="text-xs text-[#9AAEA5]">
            {searchTerm ? "No results match your search query." : "You have not started any AI chat sessions yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              className="p-4 rounded-2xl bg-[#121A17] border border-[#26352F] hover:border-[#00C896]/50 transition-all flex items-center justify-between gap-4"
            >
              <div className="space-y-1 min-w-0">
                <h3 className="text-sm font-bold text-[#F3F7F5] truncate">{conv.title}</h3>
                <div className="flex items-center gap-3 text-[11px] text-[#9AAEA5]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(conv.updated_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </span>
                  <span>•</span>
                  <span>{conv.messages_count} messages</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={`/chat`}
                  className="px-3 py-1.5 rounded-xl bg-[#18231F] hover:bg-[#26352F] text-[#00C896] text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <span>Open</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <button
                  onClick={() => deleteConversation(conv.id)}
                  title="Delete Conversation"
                  className="p-2 rounded-xl text-[#9AAEA5] hover:text-red-400 hover:bg-red-950/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
