"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import {
  AlertTriangle,
  Search,
  Filter,
  CheckCircle,
  FileImage,
  MapPin,
  Calendar,
  Edit3,
  X
} from "lucide-react";

interface ComplaintItem {
  id: number;
  user_id: number;
  user_name?: string;
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

export default function AdminComplaintsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingComplaint, setEditingComplaint] = useState<ComplaintItem | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [adminRemarks, setAdminRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const statuses = ["All", "SUBMITTED", "UNDER REVIEW", "IN PROGRESS", "RESOLVED"];

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login");
      return;
    }
    if (user && user.role === "admin") {
      fetchComplaints();
    }
  }, [user, authLoading, selectedStatus]);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== "All") params.set("status_filter", selectedStatus);

      const data = await apiFetch<ComplaintItem[]>(`/complaints?${params.toString()}`);
      setComplaints(data);
    } catch (e) {
      console.error("Failed to load admin complaints:", e);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (comp: ComplaintItem) => {
    setEditingComplaint(comp);
    setNewStatus(comp.status);
    setAdminRemarks(comp.admin_remarks || "");
  };

  const handleUpdateStatus = async () => {
    if (!editingComplaint) return;
    setSaving(true);
    try {
      const updated = await apiFetch<ComplaintItem>(`/complaints/${editingComplaint.id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: newStatus,
          admin_remarks: adminRemarks.trim() || undefined,
        }),
      });

      setComplaints((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
      );
      setEditingComplaint(null);
    } catch (e: any) {
      alert(e.message || "Failed to update complaint status.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = complaints.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.user_name && c.user_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F7F5] flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-[#F5B942]" />
            <span>Citizen Grievance Resolution Board</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#9AAEA5]">
            Review reports, view citizen photo evidence, assign ward engineers, and update statuses
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#121A17] border border-[#26352F] flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#9AAEA5] absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, citizen name, or location..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#101614] border border-[#26352F] text-xs text-[#F3F7F5] placeholder-[#9AAEA5]/50 focus:outline-none focus:border-[#00C896]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-xs text-[#9AAEA5]">Status:</span>
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-colors ${
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

      {/* Complaints Table / Cards */}
      {loading ? (
        <div className="py-20 text-center space-y-2">
          <div className="w-7 h-7 border-2 border-[#00C896] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#9AAEA5]">Loading grievance repository...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#121A17] border border-[#26352F] text-center space-y-2">
          <p className="text-sm font-bold text-[#F3F7F5]">No grievances found</p>
          <p className="text-xs text-[#9AAEA5]">There are no complaints matching the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((comp) => (
            <div
              key={comp.id}
              className="p-5 sm:p-6 rounded-3xl bg-[#121A17] border border-[#26352F] space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#00C896] bg-[#00C896]/10 px-2 py-0.5 rounded border border-[#00C896]/30">
                      #{comp.id}
                    </span>
                    <span className="text-xs font-bold text-[#F3F7F5]">{comp.title}</span>
                    <StatusBadge status={comp.priority} type="priority" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#9AAEA5]">
                    <span>Filed by: <strong className="text-[#F3F7F5]">{comp.user_name || "Citizen"}</strong></span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#00C896]" />
                      {comp.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={comp.status} />
                  <button
                    onClick={() => openEditModal(comp)}
                    className="px-3 py-1.5 rounded-xl bg-[#18231F] hover:bg-[#26352F] border border-[#26352F] text-xs font-semibold text-[#00C896] flex items-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Update Status</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-[#9AAEA5] leading-relaxed">{comp.description}</p>

              {comp.image_path && (
                <div className="pt-2">
                  <div className="text-[11px] font-semibold text-[#9AAEA5] mb-1 flex items-center gap-1">
                    <FileImage className="w-3.5 h-3.5 text-[#00C896]" />
                    <span>Citizen Photo Evidence:</span>
                  </div>
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "") : "http://localhost:8000"}${comp.image_path}`}
                    alt="Evidence"
                    className="max-h-40 rounded-xl border border-[#26352F] object-cover"
                  />
                </div>
              )}

              {comp.admin_remarks && (
                <div className="p-3 rounded-xl bg-[#101614] border border-[#26352F] text-xs">
                  <span className="text-[11px] text-[#00C896] font-semibold block">Official Remarks:</span>
                  <p className="text-[#F3F7F5]">{comp.admin_remarks}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Status Modal */}
      {editingComplaint && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl bg-[#121A17] border border-[#26352F] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#F3F7F5]">
                Update Complaint #{editingComplaint.id}
              </h3>
              <button
                onClick={() => setEditingComplaint(null)}
                className="text-[#9AAEA5] hover:text-[#F3F7F5]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#9AAEA5] block mb-1">Status Workflow</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#101614] border border-[#26352F] text-[#F3F7F5] focus:outline-none focus:border-[#00C896]"
                >
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="UNDER REVIEW">UNDER REVIEW</option>
                  <option value="IN PROGRESS">IN PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
              </div>

              <div>
                <label className="text-[#9AAEA5] block mb-1">Official Municipal Remarks (Notifies Citizen)</label>
                <textarea
                  rows={3}
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  placeholder="e.g. Assigned to Ward Road Engineer. Asphalt patching will complete tonight."
                  className="w-full p-3 rounded-xl bg-[#101614] border border-[#26352F] text-xs text-[#F3F7F5] focus:outline-none focus:border-[#00C896]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingComplaint(null)}
                className="px-4 py-2 rounded-xl text-xs text-[#9AAEA5] hover:text-[#F3F7F5]"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-[#00C896] hover:bg-[#00b284] text-[#0A0D0C] font-semibold text-xs disabled:opacity-50"
              >
                {saving ? "Updating..." : "Save & Dispatch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
