"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Bell, CalendarDays, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Avatar from "@/components/Avatar";

// Header used on the dashboard: title, search, notifications, calendar, avatar and primary action.
export default function PageHeader({ title, subtitle, notifications = 0, action }) {
  const router = useRouter();
  const { user } = useAuth();
  const [q, setQ] = useState("");

  const search = (e) => {
    e.preventDefault();
    router.push(q.trim() ? `/candidates?q=${encodeURIComponent(q.trim())}` : "/candidates");
  };

  return (
    <div className="rz-head">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="rz-head-tools">
        <form className="rz-search" onSubmit={search}>
          <Search size={15} />
          <input placeholder="Search candidates, jobs..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search candidates" />
        </form>
        <Link href="/interviews" className="rz-icon-btn" aria-label="Upcoming interviews">
          <Bell size={17} />
          {notifications > 0 && <span className="dot">{notifications}</span>}
        </Link>
        <Link href="/interviews" className="rz-icon-btn" aria-label="Calendar"><CalendarDays size={17} /></Link>
        <Avatar name={user?.name} size={38} />
        {action && (
          <Link href={action.href} className="btn"><Plus size={15} /> {action.label}</Link>
        )}
      </div>
    </div>
  );
}
