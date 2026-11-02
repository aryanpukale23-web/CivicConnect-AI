"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Bell,
  MapPin,
  Calendar,
  AlertTriangle,
  Info,
  Clock
} from "lucide-react";

interface AnnouncementItem {
  id: number;
  title: string;
  description: string;
  area: string;
  priority: string;
  created_at: string;
  expires_at?: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [loading, setLoading] = useState(true);

  const areas = [
    "All Areas",
    "Shivaji Nagar",
    "Kothrud",
    "Hadapsar",
    "Central Ward"
  ];

  const priorities = ["All", "NORMAL", "IMPORTANT", "CRITICAL"];

  useEffect(() => {
    fetchAnnouncements();
  }, [selectedArea, selectedPriority]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedArea !== "All Areas") params.set("area", selectedArea);
      if (selectedPriority !== "All") params.set("priority", selectedPriority);

      const data = await apiFetch<AnnouncementItem[]>(`/announcements?${params.toString()}`);
      setAnnouncements(data);
    } catch (e) {
      console.error("Failed to load announcements:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F7F5] flex items-center gap-2">
          <Bell className="w-7 h-7 text-[#A3E635]" />
          <span>Municipal Announcements & Notices</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#9AAEA5]">
          Stay informed on planned water shutdowns, transport line changes, road repairs, and civic notices
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#121A17] border border-[#26352F] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#00C896]" />
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#101614] border border-[#26352F] text-xs text-[#F3F7F5] focus:outline-none focus:border-[#00C896]"
          >
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-xs text-[#9AAEA5]">Priority:</span>
          {priorities.map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPriority(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                selectedPriority === p
                  ? "bg-[#00C896] text-[#0A0D0C] border-[#00C896]"
                  : "bg-[#18231F] text-[#9AAEA5] border-[#26352F] hover:text-[#F3F7F5]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="py-20 text-center space-y-2">
          <div className="w-7 h-7 border-2 border-[#00C896] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#9AAEA5]">Fetching notices...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#121A17] border border-[#26352F] text-center space-y-2">
          <Info className="w-8 h-8 text-[#9AAEA5] mx-auto opacity-50" />
          <p className="text-sm font-bold text-[#F3F7F5]">No active announcements found</p>
          <p className="text-xs text-[#9AAEA5]">There are no notices published for this filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="p-5 sm:p-6 rounded-3xl bg-[#121A17] border border-[#26352F] space-y-3 shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] text-[#00C896] bg-[#00C896]/10 px-2 py-0.5 rounded-full font-semibold border border-[#00C896]/20">
                    {ann.area}
                  </span>
                  <h3 className="text-base font-bold text-[#F3F7F5]">{ann.title}</h3>
                </div>
                <StatusBadge status={ann.priority} type="priority" />
              </div>

              <p className="text-xs sm:text-sm text-[#9AAEA5] leading-relaxed">
                {ann.description}
              </p>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-[#9AAEA5] pt-3 border-t border-[#26352F]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#9AAEA5]" />
                  Published: {new Date(ann.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                {ann.expires_at && (
                  <span className="flex items-center gap-1 text-amber-400">
                    <Clock className="w-3.5 h-3.5" />
                    Valid until: {new Date(ann.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
