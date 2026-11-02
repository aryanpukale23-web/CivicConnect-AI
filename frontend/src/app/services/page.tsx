"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  Search,
  MapPin,
  Clock,
  Phone,
  Building,
  Truck,
  Bus,
  Droplet,
  Zap,
  PhoneCall,
  HeartPulse,
  Calendar,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface ScheduleItem {
  id: number;
  area: string;
  day: string;
  start_time: string;
  end_time: string;
  details: string;
}

interface ServiceItem {
  id: number;
  category: string;
  service_name: string;
  description: string;
  area: string;
  contact_number: string;
  working_hours: string;
  website?: string;
  schedules?: ScheduleItem[];
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedServiceId, setExpandedServiceId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const categories = [
    "All",
    "Waste Management",
    "Public Transport",
    "Emergency",
    "Water Supply",
    "Electricity",
    "Healthcare"
  ];

  const areas = [
    "All Areas",
    "Shivaji Nagar",
    "Kothrud",
    "Hadapsar",
    "Central Ward"
  ];

  useEffect(() => {
    fetchServicesAndSchedules();
  }, [selectedCategory, selectedArea, searchTerm]);

  const fetchServicesAndSchedules = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "All") params.set("category", selectedCategory);
      if (selectedArea !== "All Areas") params.set("area", selectedArea);
      if (searchTerm.trim()) params.set("search", searchTerm.trim());

      const [servicesData, schedulesData] = await Promise.all([
        apiFetch<ServiceItem[]>(`/services?${params.toString()}`),
        apiFetch<ScheduleItem[]>("/schedules")
      ]);

      setServices(servicesData);
      setSchedules(schedulesData);
    } catch (e) {
      console.error("Failed to load services:", e);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes("waste") || c.includes("garbage")) return <Truck className="w-5 h-5 text-[#00C896]" />;
    if (c.includes("transport") || c.includes("bus")) return <Bus className="w-5 h-5 text-[#A3E635]" />;
    if (c.includes("water")) return <Droplet className="w-5 h-5 text-sky-400" />;
    if (c.includes("electricity")) return <Zap className="w-5 h-5 text-amber-400" />;
    if (c.includes("emergency")) return <PhoneCall className="w-5 h-5 text-red-400" />;
    if (c.includes("health") || c.includes("hospital")) return <HeartPulse className="w-5 h-5 text-rose-400" />;
    return <Building className="w-5 h-5 text-[#00C896]" />;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F7F5] flex items-center gap-2">
          <Building className="w-7 h-7 text-[#00C896]" />
          <span>Civic Service Directory</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#9AAEA5]">
          Verified directory of municipal departments, transport routes, emergency contacts, and waste collection schedules
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#121A17] border border-[#26352F] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Text Search */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-[#9AAEA5] absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search services by keyword, route, hospital, or helpline..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#101614] border border-[#26352F] text-xs text-[#F3F7F5] placeholder-[#9AAEA5]/50 focus:outline-none focus:border-[#00C896]"
            />
          </div>

          {/* Area Selector */}
          <div className="relative">
            <MapPin className="w-4 h-4 text-[#9AAEA5] absolute left-3.5 top-3.5" />
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#101614] border border-[#26352F] text-xs text-[#F3F7F5] focus:outline-none focus:border-[#00C896] cursor-pointer"
            >
              {areas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
                selectedCategory === cat
                  ? "bg-[#00C896] text-[#0A0D0C] border-[#00C896]"
                  : "bg-[#18231F] text-[#9AAEA5] border-[#26352F] hover:text-[#F3F7F5]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-2">
          <div className="w-7 h-7 border-2 border-[#00C896] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#9AAEA5]">Loading services directory...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#121A17] border border-[#26352F] text-center space-y-2">
          <p className="text-sm font-bold text-[#F3F7F5]">No matching civic services found</p>
          <p className="text-xs text-[#9AAEA5]">Try adjusting your search keywords or area filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((srv) => {
            const serviceSchedules = schedules.filter((s) => s.service_id === srv.id);
            const isExpanded = expandedServiceId === srv.id;

            return (
              <div
                key={srv.id}
                className="p-5 rounded-2xl bg-[#121A17] border border-[#26352F] hover:border-[#26352F]/90 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-[#18231F] border border-[#26352F]">
                        {getCategoryIcon(srv.category)}
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#00C896] tracking-wider">
                          {srv.category}
                        </span>
                        <h3 className="text-sm font-bold text-[#F3F7F5] leading-snug">
                          {srv.service_name}
                        </h3>
                      </div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-lg bg-[#18231F] border border-[#26352F] text-[#9AAEA5] whitespace-nowrap">
                      {srv.area}
                    </span>
                  </div>

                  <p className="text-xs text-[#9AAEA5] leading-relaxed">{srv.description}</p>
                </div>

                <div className="space-y-3 pt-2 border-t border-[#26352F]/70 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[#9AAEA5]">
                    <div className="flex items-center gap-1.5 text-[#00C896] font-semibold">
                      <Phone className="w-3.5 h-3.5" />
                      <a href={`tel:${srv.contact_number}`} className="hover:underline">
                        {srv.contact_number}
                      </a>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#9AAEA5]" />
                      <span>{srv.working_hours}</span>
                    </div>
                  </div>

                  {/* Toggle Associated Schedules if available */}
                  {serviceSchedules.length > 0 && (
                    <div>
                      <button
                        onClick={() => setExpandedServiceId(isExpanded ? null : srv.id)}
                        className="w-full text-left text-[11px] font-semibold text-[#00C896] hover:underline flex items-center justify-between pt-1"
                      >
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Timetable / Operating Slots ({serviceSchedules.length})</span>
                        </span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 space-y-2 pt-2 border-t border-[#26352F]">
                          {serviceSchedules.map((sch) => (
                            <div
                              key={sch.id}
                              className="p-2.5 rounded-xl bg-[#101614] border border-[#26352F] space-y-1 text-xs"
                            >
                              <div className="flex items-center justify-between text-[#F3F7F5] font-semibold text-[11px]">
                                <span>{sch.day}</span>
                                <span className="text-[#00C896]">{sch.start_time} - {sch.end_time}</span>
                              </div>
                              <p className="text-[11px] text-[#9AAEA5]">{sch.details}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
