"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, getAuthToken } from "@/lib/api";
import {
  FileText,
  Upload,
  Trash2,
  CheckCircle2,
  Database,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight
} from "lucide-react";

interface DocumentItem {
  id: number;
  filename: string;
  file_type: string;
  title?: string;
  chunks_count: number;
  created_at: string;
}

export default function AdminDocumentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login");
      return;
    }
    if (user && user.role === "admin") {
      fetchDocuments();
    }
  }, [user, authLoading]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<DocumentItem[]>("/documents");
      setDocuments(data);
    } catch (e) {
      console.error("Failed to load documents:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (title.trim()) formData.append("title", title.trim());

      const token = getAuthToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/documents`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Document upload failed");
      }

      setFile(null);
      setTitle("");
      fetchDocuments();
    } catch (err: any) {
      alert(err.message || "Failed to upload and index document.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this document and its vector embeddings?")) return;
    try {
      await apiFetch(`/documents/${id}`, { method: "DELETE" });
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (e) {
      alert("Failed to delete document.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F7F5] flex items-center gap-2">
          <Database className="w-7 h-7 text-[#00C896]" />
          <span>Civic Knowledge Base & RAG Indexing</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#9AAEA5]">
          Upload official municipal circulars (PDF, TXT, DOCX) to automatically generate vector chunks for grounded AI Q&A
        </p>
      </div>

      {/* Upload Box */}
      <div className="p-6 rounded-3xl bg-[#121A17] border border-[#26352F] space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#00C896]">
          <Cpu className="w-4 h-4" />
          <span>Upload New Official Document for Vector Processing</span>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-[#9AAEA5]">Document Title / Circular Subject</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. PMC Solid Waste Bye-Laws 2026"
                className="w-full px-3 py-2.5 rounded-xl bg-[#101614] border border-[#26352F] text-xs text-[#F3F7F5] placeholder-[#9AAEA5]/50 focus:outline-none focus:border-[#00C896]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-[#9AAEA5]">Select File (PDF, TXT, DOCX)</label>
              <input
                type="file"
                required
                accept=".pdf,.txt,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 rounded-xl bg-[#101614] border border-[#26352F] text-xs text-[#F3F7F5] file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#00C896] file:text-[#0A0D0C] hover:file:bg-[#00b284]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-[#9AAEA5]">
              Document will be cleaned, chunked into overlapping segments, and indexed with embeddings.
            </span>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2.5 rounded-xl bg-[#00C896] hover:bg-[#00b284] disabled:opacity-50 text-[#0A0D0C] font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-[#00C896]/20 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? "Extracting & Embedding..." : "Upload & Index"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Indexed Documents Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[#9AAEA5] uppercase tracking-wider">
          Currently Indexed Civic Documents ({documents.length})
        </h2>

        {loading ? (
          <div className="py-20 text-center space-y-2">
            <div className="w-7 h-7 border-2 border-[#00C896] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#9AAEA5]">Loading document catalog...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[#121A17] border border-[#26352F] text-center space-y-2">
            <FileText className="w-8 h-8 text-[#9AAEA5] mx-auto opacity-50" />
            <p className="text-sm font-bold text-[#F3F7F5]">No documents uploaded yet</p>
            <p className="text-xs text-[#9AAEA5]">Upload your first civic circular above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-5 rounded-2xl bg-[#121A17] border border-[#26352F] hover:border-[#26352F]/90 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#00C896] uppercase bg-[#00C896]/10 px-2 py-0.5 rounded border border-[#00C896]/30">
                      {doc.file_type}
                    </span>
                    <h3 className="text-sm font-bold text-[#F3F7F5]">{doc.title || doc.filename}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#9AAEA5]">
                    <span>File: {doc.filename}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-[#00C896]">
                      <Layers className="w-3.5 h-3.5" />
                      <strong>{doc.chunks_count}</strong> Vector Chunks Indexed
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 rounded-xl text-[#9AAEA5] hover:text-red-400 hover:bg-red-950/30 transition-colors"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
