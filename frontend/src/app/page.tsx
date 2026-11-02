"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  AlertTriangle,
  FileSearch,
  Truck,
  Bus,
  Droplet,
  Zap,
  PhoneCall,
  ShieldCheck,
  Languages,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  MapPin
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [quickQuery, setQuickQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      router.push(`/chat?q=${encodeURIComponent(quickQuery.trim())}`);
    } else {
      router.push("/chat");
    }
  };

  const samplePrompts = [
    "When is garbage collected in Shivaji Nagar?",
    "Show bus timings for Route 202 to Pune Station",
    "Emergency helpline for ambulance and fire",
    "How can I report a deep pothole?",
    "Any water shutdown announcement today?",
    "What are waste segregation rules?"
  ];

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative text-center space-y-6 pt-8 pb-12 overflow-hidden">
        {/* Decorative backdrop light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#00C896]/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121A17] border border-[#26352F] text-xs font-semibold text-[#00C896] shadow-inner">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Your AI Assistant for Smarter Communities</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#F3F7F5] max-w-4xl mx-auto leading-tight sm:leading-none">
          Civic assistance, powered by{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00C896] via-[#A3E635] to-[#00C896]">
            verified intelligence.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-[#9AAEA5] max-w-2xl mx-auto leading-relaxed">
          Ask real-time community questions about garbage collection, public bus timings, emergency helplines, or file civic complaints with photos and real-time status tracking.
        </p>

        {/* Interactive Query Input Bar */}
        <div className="max-w-2xl mx-auto pt-2">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <div className="absolute left-4 text-[#9AAEA5]">
              <MessageSquare className="w-5 h-5 text-[#00C896]" />
            </div>
            <input
              type="text"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              placeholder="Ask anything (e.g. 'When is garbage collected in Kothrud?')"
              className="w-full pl-12 pr-32 py-4 rounded-2xl bg-[#121A17] border border-[#26352F] text-[#F3F7F5] placeholder-[#9AAEA5]/60 focus:outline-none focus:border-[#00C896] focus:ring-2 focus:ring-[#00C896]/20 transition-all text-sm shadow-xl"
            />
            <button
              type="submit"
              className="absolute right-2 px-5 py-2.5 rounded-xl bg-[#00C896] hover:bg-[#00b284] text-[#0A0D0C] font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-[#00C896]/20"
            >
              <span>Ask AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Prompt Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <span className="text-xs text-[#9AAEA5] font-medium">Try asking:</span>
            {samplePrompts.slice(0, 3).map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => router.push(`/chat?q=${encodeURIComponent(prompt)}`)}
                className="text-xs px-2.5 py-1 rounded-lg bg-[#18231F] border border-[#26352F] text-[#9AAEA5] hover:text-[#00C896] hover:border-[#00C896]/50 transition-colors"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>

        {/* Key Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/chat"
            className="px-6 py-3 rounded-xl bg-[#00C896] hover:bg-[#00b284] text-[#0A0D0C] font-semibold text-sm shadow-lg shadow-[#00C896]/20 flex items-center gap-2 transition-transform hover:-translate-y-0.5"
          >
            <MessageSquare className="w-4 h-4" />
            Launch AI Assistant
          </Link>
          <Link
            href="/complaints/new"
            className="px-6 py-3 rounded-xl bg-[#121A17] hover:bg-[#18231F] border border-[#26352F] text-[#F3F7F5] font-semibold text-sm flex items-center gap-2 transition-transform hover:-translate-y-0.5"
          >
            <AlertTriangle className="w-4 h-4 text-[#F5B942]" />
            Report Civic Issue
          </Link>
          <Link
            href="/services"
            className="px-6 py-3 rounded-xl bg-[#121A17] hover:bg-[#18231F] border border-[#26352F] text-[#F3F7F5] font-semibold text-sm flex items-center gap-2 transition-transform hover:-translate-y-0.5"
          >
            Explore Services
          </Link>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Civic Query Categories", value: "13+", sub: "Transport, Waste, Water, SOS" },
          { label: "Information Reliability", value: "100%", sub: "Zero AI Hallucination Policy" },
          { label: "Supported Languages", value: "3", sub: "English, हिंदी, मराठी" },
          { label: "Grievance Resolution", value: "4-Stage", sub: "Submitted to Resolved Stepper" },
        ].map((item, i) => (
          <div key={i} className="p-5 rounded-2xl bg-[#121A17] border border-[#26352F] text-center space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-[#00C896]">{item.value}</div>
            <div className="text-xs font-semibold text-[#F3F7F5]">{item.label}</div>
            <div className="text-[11px] text-[#9AAEA5]">{item.sub}</div>
          </div>
        ))}
      </section>

      {/* Core Capabilities Grid */}
      <section id="features" className="space-y-8">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F3F7F5]">Comprehensive Community Intelligence</h2>
          <p className="text-xs sm:text-sm text-[#9AAEA5]">
            Engineered specifically to handle common local challenges without generic search engine noise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Truck,
              color: "#00C896",
              title: "Garbage Pickup & Schedules",
              desc: "Know exactly when wet and dry waste trucks visit your neighborhood, segregation bye-laws, and collection points."
            },
            {
              icon: Bus,
              color: "#A3E635",
              title: "Public Bus Timetables",
              desc: "Check municipal bus corridor routes (e.g. Route 101, 202, 303), frequencies, first and last bus timings, and depot contacts."
            },
            {
              icon: PhoneCall,
              color: "#F5B942",
              title: "Emergency SOS Directory",
              desc: "Instant verified one-tap contacts for Police (100), Fire (101), Ambulance (108), Women Helpline (1091), and Disaster cells."
            },
            {
              icon: Droplet,
              color: "#38bdf8",
              title: "Water & Electricity Outages",
              desc: "Search planned maintenance water cuts and feeder repairs with scheduled resumption times before asking."
            },
            {
              icon: AlertTriangle,
              color: "#f87171",
              title: "Photo-Evidence Grievances",
              desc: "File complaints for potholes, broken street lights, or garbage overflows with photos and track through 4 resolution stages."
            },
            {
              icon: FileSearch,
              color: "#c084fc",
              title: "RAG Civic Document Search",
              desc: "Ask questions grounded directly in uploaded municipal circulars and official rulebooks using vector search."
            }
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-[#121A17] border border-[#26352F] hover:border-[#00C896]/50 hover:bg-[#18231F] transition-all space-y-3 group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${card.color}15`, color: card.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#F3F7F5]">{card.title}</h3>
                <p className="text-xs text-[#9AAEA5] leading-relaxed">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Zero Hallucination Callout */}
      <section className="p-8 rounded-3xl bg-gradient-to-r from-[#121A17] via-[#18231F] to-[#121A17] border border-[#26352F] space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#00C896]">
              <ShieldCheck className="w-4 h-4" />
              <span>STRICT CIVIC DATA INTEGRITY</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#F3F7F5]">
              Never Hallucinates Civic Details
            </h3>
            <p className="text-xs sm:text-sm text-[#9AAEA5] leading-relaxed">
              If an inquiry lacks verified schedule records or document citations, CivicConnect AI safely invokes its smart fallback protocol—directing you to the verified municipal helpline (1800-103-0222) rather than fabricating answers.
            </p>
          </div>
          <Link
            href="/chat"
            className="px-6 py-3 rounded-xl bg-[#00C896] hover:bg-[#00b284] text-[#0A0D0C] font-semibold text-sm whitespace-nowrap shadow-lg shadow-[#00C896]/20 flex items-center gap-2"
          >
            <span>Test the AI Chatbot</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
