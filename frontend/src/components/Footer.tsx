import React from "react";
import Link from "next/link";
import { Shield, PhoneCall, ExternalLink, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#101614] border-t border-[#26352F] mt-auto">
      {/* Emergency Helpline Banner */}
      <div className="bg-[#121A17] border-b border-[#26352F] py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-[#F5B942] font-semibold">
            <PhoneCall className="w-4 h-4" />
            <span>24/7 Emergency Helplines:</span>
          </div>
          <div className="flex flex-wrap gap-4 text-[#9AAEA5]">
            <span>Police: <strong className="text-[#F3F7F5]">100</strong></span>
            <span>Fire: <strong className="text-[#F3F7F5]">101</strong></span>
            <span>Ambulance: <strong className="text-[#F3F7F5]">108</strong></span>
            <span>Women: <strong className="text-[#F3F7F5]">1091</strong></span>
            <span>Childline: <strong className="text-[#F3F7F5]">1098</strong></span>
            <span>Disaster: <strong className="text-[#F3F7F5]">1077</strong></span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#00C896] flex items-center justify-center text-[#0A0D0C] font-bold">
                <Shield className="w-4 h-4 text-[#0A0D0C]" />
              </div>
              <span className="text-lg font-bold text-[#F3F7F5]">CivicConnect AI</span>
            </div>
            <p className="text-xs text-[#9AAEA5] leading-relaxed">
              Your AI Assistant for Smarter Communities. Bridging citizens with municipal services through verified conversational intelligence, RAG document search, and real-time grievance tracking.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-[#F3F7F5] uppercase tracking-wider mb-3">Community Hub</h4>
            <ul className="space-y-2 text-xs text-[#9AAEA5]">
              <li><Link href="/chat" className="hover:text-[#00C896]">AI Civic Assistant</Link></li>
              <li><Link href="/services" className="hover:text-[#00C896]">Directory of Services</Link></li>
              <li><Link href="/complaints/new" className="hover:text-[#00C896]">Report a Problem</Link></li>
              <li><Link href="/announcements" className="hover:text-[#00C896]">Municipal Notices</Link></li>
            </ul>
          </div>

          {/* Verification & Compliance */}
          <div>
            <h4 className="text-xs font-semibold text-[#F3F7F5] uppercase tracking-wider mb-3">AI Verification</h4>
            <ul className="space-y-2 text-xs text-[#9AAEA5]">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C896]" />
                Zero Hallucination Guarantee
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C896]" />
                Multilingual: EN, HI, MR
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C896]" />
                RAG Document Vector Index
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C896]" />
                Role-Based Redressal Workflows
              </li>
            </ul>
          </div>

          {/* Academic / Project Details */}
          <div>
            <h4 className="text-xs font-semibold text-[#F3F7F5] uppercase tracking-wider mb-3">Project Scope</h4>
            <p className="text-xs text-[#9AAEA5] leading-relaxed mb-3">
              Built as a comprehensive full-stack civic technology prototype for community queries, public transport timetables, garbage schedules, and grievance resolution.
            </p>
            <div className="text-[11px] text-[#9AAEA5]">
              Platform Version: <span className="text-[#00C896]">v1.0.0 (Production-Ready)</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#26352F] flex flex-col sm:flex-row items-center justify-between text-xs text-[#9AAEA5] gap-3">
          <p>© {new Date().getFullYear()} CivicConnect AI. All verified municipal data is cataloged from official civic sources.</p>
          <div className="flex items-center gap-1">
            <span>Designed for smarter, transparent, and cleaner cities</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
