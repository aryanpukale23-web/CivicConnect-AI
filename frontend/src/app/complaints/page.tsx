"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import {
  AlertTriangle,
  Search,
  Filter,
  Plus,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileImage
} from "lucide-react";

interface ComplaintItem {
  id: number;
  category: string;
  title: string;
  description: string;
  location: string;
  priority: string;
  status: string;
  image_path?: string;
  admin_remarks?: string;
  created_at: string;
  updated_at: string;
}

export default function ComplaintsListPage() {
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const statuses = ["All", "SUBMITTED", "UNDER REVIEW", "IN PROGRESS", "RESOLVED"];
  const categories = [
    "All",
    "Garbage",
    "Road/Pothole",
    "Water",
    "Electricity",
    "Street Light",
    "Drainage",
    "Public Safety",
    "Other"
  ];

  useEffect(() => {
    fetchComplaints();
  }, [selectedStatus, selectedCategory]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== "All") params.set("status_filter", selectedStatus);
      if (selectedCategory !== "All") params.set("category", selectedCategory);

      const data = await apiFetch<ComplaintItem[]>(`/complaints?${params.toString()}`);
      setComplaints(data);
    } catch (e) {
      console.error("Failed to load complaints:", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusSteps = ["SUBMITTED", "UNDER REVIEW", "IN PROGRESS", "RESOLVED"];

  const getStepIndex = (currentStatus: string) => {
    const idx = statusSteps.indexOf(currentStatus.toUpperCase());
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F7F5] flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-[#F5B942]" />
            <span>Civic Complaints & Grievances</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#9AAEA5]">
            Track the end-to-end resolution progress of your filed community problems
          </p>
        </div>

        <Link
          href="/complaints/new"
          className="px-4 py-2.5 rounded-xl bg-[#00C896] hover:bg-[#00b284] text-[#0A0D0C] font-semibold text-xs flex items-center gap-2 shadow-md shadow-[#00C896]/20 transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Problem</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#121A17] border border-[#26352F] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-[#9AAEA5] absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, location, or description..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#101614] border border-[#26352F] text-xs text-[#F3F7F5] placeholder-[#9AAEA5]/50 focus:outline-none focus:border-[#00C896]"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#101614] border border-[#26352F] text-xs text-[#F3F7F5] focus:outline-none focus:border-[#00C896]"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  Category: {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs text-[#9AAEA5] whitespace-nowrap font-medium">Status:</span>
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`whitespace-nowrap px-3 py-1 rounded-xl text-xs font-semibold transition-colors border ${
                selectedStatus === st
                  ? "bg-[#00C896] text-[#0A0D0C] border-[#00C896]"
                  : "bg-[#18231F] text-[#9AAEA5] border-[#26352F] hover:text-[#F3F7F5]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List with Stepper */}
      {loading ? (
        <div className="py-20 text-center space-y-2">
          <div className="w-7 h-7 border-2 border-[#00C896] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#9AAEA5]">Loading complaints...</p>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#121A17] border border-[#26352F] text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-[#9AAEA5] mx-auto opacity-50" />
          <p className="text-sm font-bold text-[#F3F7F5]">No complaints match current filters</p>
          <p className="text-xs text-[#9AAEA5]">Submit a new civic problem or broaden your filter search.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((comp) => {
            const currentStepIdx = getStepIndex(comp.status);

            return (
              <div
                key={comp.id}
                className="p-5 sm:p-6 rounded-3xl bg-[#121A17] border border-[#26352F] space-y-4 shadow-lg"
              >
                {/* Top Info Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#00C896] bg-[#00C896]/10 px-2 py-0.5 rounded border border-[#00C896]/30">
                        #{comp.id}
                      </span>
                      <span className="text-xs text-[#9AAEA5] uppercase font-semibold">
                        {comp.category}
                      </span>
                      <StatusBadge status={comp.priority} type="priority" />
                    </div>
                    <h3 className="text-base font-bold text-[#F3F7F5]">{comp.title}</h3>
                  </div>
                  <StatusBadge status={comp.status} />
                </div>

                <p className="text-xs text-[#9AAEA5] leading-relaxed">{comp.description}</p>

                {/* Evidence Image Thumbnail */}
                {comp.image_path && (
                  <div className="pt-2">
                    <div className="text-[11px] font-semibold text-[#9AAEA5] mb-1 flex items-center gap-1">
                      <FileImage className="w-3.5 h-3.5 text-[#00C896]" />
                      <span>Uploaded Photographic Evidence:</span>
                    </div>
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "") : "http://localhost:8000"}${comp.image_path}`}
                      alt="Complaint Evidence"
                      className="max-h-40 rounded-xl border border-[#26352F] object-cover"
                    />
                  </div>
                )}

                {/* 4-Stage Workflow Progress Stepper */}
                <div className="pt-3 border-t border-[#26352F]">
                  <div className="text-[11px] font-semibold text-[#9AAEA5] mb-3">
                    Resolution Lifecycle Tracker:
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    {statusSteps.map((step, sIdx) => {
                      const isComplete = sIdx <= currentStepIdx;
                      const isCurrent = sIdx === currentStepIdx;

                      return (
                        <div key={step} className="space-y-1.5">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isComplete
                                ? "bg-[#00C896]"
                                : "bg-[#26352F]"
                            } ${isCurrent ? "animate-pulse" : ""}`}
                          />
                          <span
                            className={`text-[10px] font-bold block truncate ${
                              isComplete ? "text-[#00C896]" : "text-[#9AAEA5]/60"
                            }`}
                          >
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Admin Remarks (if present) */}
                {comp.admin_remarks && (
                  <div className="p-3 rounded-xl bg-[#18231F] border border-[#00C896]/30 text-xs space-y-1">
                    <span className="font-bold text-[#00C896] block">
                      Municipal Official Remarks:
                    </span>
                    <p className="text-[#F3F7F5] leading-relaxed">{comp.admin_remarks}</p>
                  </div>
                )}

                {/* Location & Timestamps */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#9AAEA5] pt-2 border-t border-[#26352F]/60">
                  <span className="flex items-center gap-1 text-[#F3F7F5]">
                    <MapPin className="w-3.5 h-3.5 text-[#00C896]" />
                    {comp.location}
                  </span>
                  <div className="flex items-center gap-3">
                    <span>
                      Filed: {new Date(comp.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    </span>
                    <span>
                      Updated: {new Date(comp.updated_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
