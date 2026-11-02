"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getAuthToken } from "@/lib/api";
import {
  AlertTriangle,
  Upload,
  Camera,
  MapPin,
  CheckCircle,
  ArrowLeft,
  ShieldAlert,
  Sparkles
} from "lucide-react";

export default function NewComplaintPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [category, setCategory] = useState("Road/Pothole");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(user?.area || "Shivaji Nagar");
  const [priority, setPriority] = useState("MEDIUM");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    "Garbage",
    "Road/Pothole",
    "Water",
    "Electricity",
    "Street Light",
    "Drainage",
    "Public Safety",
    "Other"
  ];

  const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("location", location.trim());
      formData.append("priority", priority);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const token = getAuthToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/complaints`,
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
        throw new Error(err.detail || "Failed to submit grievance");
      }

      router.push("/complaints");
    } catch (err: any) {
      setError(err.message || "Failed to submit complaint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/complaints"
        className="inline-flex items-center gap-1.5 text-xs text-[#9AAEA5] hover:text-[#00C896] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to My Complaints</span>
      </Link>

      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[#F3F7F5] flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-[#F5B942]" />
          <span>Report a Civic Problem</span>
        </h1>
        <p className="text-xs text-[#9AAEA5]">
          Submit potholes, broken street lights, or water leaks with photo evidence for prompt municipal action
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6 rounded-3xl bg-[#121A17] border border-[#26352F] space-y-5 shadow-xl"
      >
        {error && (
          <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-300 text-xs">
            {error}
          </div>
        )}

        {/* Category & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#9AAEA5]">Problem Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#101614] border border-[#26352F] text-xs text-[#F3F7F5] focus:outline-none focus:border-[#00C896]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#9AAEA5]">Priority Level</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#101614] border border-[#26352F] text-xs text-[#F3F7F5] focus:outline-none focus:border-[#00C896]"
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Complaint Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#9AAEA5]">Short Title / Summary</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Deep pothole on FC Road causing traffic accidents"
            className="w-full px-3 py-2.5 rounded-xl bg-[#101614] border border-[#26352F] text-xs text-[#F3F7F5] placeholder-[#9AAEA5]/50 focus:outline-none focus:border-[#00C896]"
          />
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#9AAEA5]">Exact Location / Landmark</label>
          <div className="relative flex items-center">
            <MapPin className="w-4 h-4 text-[#00C896] absolute left-3" />
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Near Goodluck Chowk, Deccan Gymkhana"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#101614] border border-[#26352F] text-xs text-[#F3F7F5] placeholder-[#9AAEA5]/50 focus:outline-none focus:border-[#00C896]"
            />
          </div>
        </div>

        {/* Detailed Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#9AAEA5]">Detailed Description</label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide context: size, hazard risk, how long the issue has persisted..."
            className="w-full p-3 rounded-xl bg-[#101614] border border-[#26352F] text-xs text-[#F3F7F5] placeholder-[#9AAEA5]/50 focus:outline-none focus:border-[#00C896]"
          />
        </div>

        {/* Photo Evidence Upload */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#9AAEA5] flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-[#00C896]" />
            <span>Upload Photo Evidence (Optional)</span>
          </label>

          <div className="p-4 rounded-2xl bg-[#101614] border-2 border-dashed border-[#26352F] hover:border-[#00C896]/50 transition-colors text-center space-y-2">
            {previewUrl ? (
              <div className="space-y-2">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded-xl border border-[#26352F] object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setPreviewUrl(null);
                  }}
                  className="text-xs text-red-400 hover:underline"
                >
                  Remove Photo
                </button>
              </div>
            ) : (
              <div>
                <Upload className="w-8 h-8 text-[#9AAEA5] mx-auto opacity-50 mb-1" />
                <label className="cursor-pointer text-xs text-[#00C896] hover:underline font-semibold block">
                  <span>Click to select an image from your device</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-[#9AAEA5]">Supports PNG, JPG, WEBP up to 10MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-[#00C896] hover:bg-[#00b284] disabled:opacity-50 text-[#0A0D0C] font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-[#00C896]/20 transition-all"
        >
          {loading ? "Registering Complaint..." : "Submit Civic Complaint"}
        </button>
      </form>
    </div>
  );
}
