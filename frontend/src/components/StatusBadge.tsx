import React from "react";

interface StatusBadgeProps {
  status: string;
  type?: "status" | "priority";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = "status" }) => {
  const s = status.toUpperCase();

  if (type === "priority") {
    let colorClass = "bg-gray-800 text-gray-300 border-gray-700";
    if (s === "URGENT" || s === "CRITICAL") {
      colorClass = "bg-red-950/80 text-red-400 border-red-800";
    } else if (s === "HIGH" || s === "IMPORTANT") {
      colorClass = "bg-amber-950/80 text-amber-400 border-amber-800";
    } else if (s === "MEDIUM") {
      colorClass = "bg-yellow-950/70 text-yellow-300 border-yellow-800";
    } else if (s === "LOW" || s === "NORMAL") {
      colorClass = "bg-emerald-950/60 text-emerald-400 border-emerald-800";
    }

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${colorClass}`}>
        {status}
      </span>
    );
  }

  // Complaint Lifecycle Status
  let badgeStyle = "bg-gray-800 text-gray-300 border-gray-700";
  let dotColor = "bg-gray-400";

  if (s === "SUBMITTED") {
    badgeStyle = "bg-blue-950/80 text-blue-300 border-blue-800";
    dotColor = "bg-blue-400";
  } else if (s === "UNDER REVIEW") {
    badgeStyle = "bg-amber-950/80 text-amber-300 border-amber-700";
    dotColor = "bg-amber-400 animate-pulse";
  } else if (s === "IN PROGRESS") {
    badgeStyle = "bg-purple-950/80 text-purple-300 border-purple-700";
    dotColor = "bg-purple-400 animate-ping";
  } else if (s === "RESOLVED") {
    badgeStyle = "bg-emerald-950/80 text-emerald-300 border-emerald-700";
    dotColor = "bg-emerald-400";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badgeStyle}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {status}
    </span>
  );
};
